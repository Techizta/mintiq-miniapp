/**
 * MintIQ Mini App API Routes
 * 
 * Add this file to your mintiq-bot repository:
 * src/routes/miniapp.js
 * 
 * Then register in src/index.js:
 * const miniappRoutes = require('./routes/miniapp');
 * app.use('/api/miniapp', miniappRoutes);
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../db');
const jwt = require('jsonwebtoken');

// ============================================
// MIDDLEWARE: Verify Telegram initData
// ============================================

const verifyTelegramAuth = (req, res, next) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(401).json({ error: 'No init data provided' });
    }

    // Parse initData
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // Sort and create data check string
    const dataCheckArr = [];
    urlParams.sort();
    urlParams.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    const dataCheckString = dataCheckArr.join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return res.status(401).json({ error: 'Invalid hash' });
    }

    // Check auth_date (max 1 hour old)
    const authDate = parseInt(urlParams.get('auth_date'));
    if (Date.now() / 1000 - authDate > 3600) {
      return res.status(401).json({ error: 'Auth data expired' });
    }

    // Parse user data
    const userData = JSON.parse(urlParams.get('user'));
    req.telegramUser = userData;
    
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// JWT Auth middleware for subsequent requests
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'mintiq-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * POST /api/miniapp/auth
 * Authenticate via Telegram initData
 */
router.post('/auth', verifyTelegramAuth, async (req, res) => {
  try {
    const tgUser = req.telegramUser;
    
    // Find or create user
    let user = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [tgUser.id]
    );

    if (user.rows.length === 0) {
      // Create new user
      const referralCode = generateReferralCode();
      user = await pool.query(
        `INSERT INTO users (telegram_id, username, first_name, last_name, referral_code, satz_balance)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [tgUser.id, tgUser.username, tgUser.first_name, tgUser.last_name, referralCode, 500]
      );
      
      // Record welcome bonus
      await pool.query(
        `INSERT INTO transactions (user_id, type, amount, description)
         VALUES ($1, 'welcome_bonus', 500, 'Welcome bonus!')`,
        [user.rows[0].id]
      );
    } else {
      // Update user info
      await pool.query(
        `UPDATE users SET username = $2, first_name = $3, last_name = $4, last_active = NOW()
         WHERE telegram_id = $1`,
        [tgUser.id, tgUser.username, tgUser.first_name, tgUser.last_name]
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.rows[0].id, telegramId: tgUser.id },
      process.env.JWT_SECRET || 'mintiq-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: sanitizeUser(user.rows[0])
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// ============================================
// USER ENDPOINTS
// ============================================

router.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT u.*, 
        (SELECT COUNT(*) FROM predictions WHERE user_id = u.id) as predictions_made,
        (SELECT COUNT(*) FROM predictions WHERE user_id = u.id AND is_winner = true) as predictions_won,
        (SELECT COALESCE(SUM(payout), 0) FROM predictions WHERE user_id = u.id AND is_winner = true) as total_won,
        (SELECT COUNT(*) FROM friendships WHERE (user_id = u.id OR friend_id = u.id) AND status = 'accepted') as friend_count
       FROM users u WHERE u.id = $1`,
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.rows[0];
    userData.win_rate = userData.predictions_made > 0 
      ? (userData.predictions_won / userData.predictions_made * 100) 
      : 0;

    res.json({ user: sanitizeUser(userData) });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/user/balance', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT satz_balance FROM users WHERE id = $1',
      [req.user.userId]
    );
    res.json({ balance: result.rows[0]?.satz_balance || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

router.get('/user/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM transactions WHERE user_id = $1`;
    const params = [req.user.userId];

    if (type) {
      query += ` AND type = $2`;
      params.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ transactions: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.put('/user/settings', authenticateToken, async (req, res) => {
  try {
    const { notifications_enabled, win_broadcasts_enabled } = req.body;
    
    await pool.query(
      `UPDATE users SET 
        notifications_enabled = COALESCE($2, notifications_enabled),
        win_broadcasts_enabled = COALESCE($3, win_broadcasts_enabled)
       WHERE id = $1`,
      [req.user.userId, notifications_enabled, win_broadcasts_enabled]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ============================================
// QUEST ENDPOINTS
// ============================================

router.get('/quests', authenticateToken, async (req, res) => {
  try {
    const { category = 'all', status = 'active', limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT q.*, 
        COALESCE(q.pool_a, 0) as pool_a,
        COALESCE(q.pool_b, 0) as pool_b,
        (SELECT COUNT(*) FROM predictions WHERE quest_id = q.id) as participant_count
      FROM quests q
      WHERE q.status = $1
    `;
    const params = [status];

    if (category !== 'all') {
      query += ` AND q.category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY q.betting_deadline ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ quests: result.rows });
  } catch (error) {
    console.error('Quests error:', error);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
});

router.get('/quests/:questId', authenticateToken, async (req, res) => {
  try {
    const { questId } = req.params;
    
    const quest = await pool.query(
      `SELECT q.*, 
        (SELECT COUNT(*) FROM predictions WHERE quest_id = q.id) as participant_count
       FROM quests q WHERE q.id = $1`,
      [questId]
    );

    if (quest.rows.length === 0) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Check if user has already bet
    const userBet = await pool.query(
      'SELECT * FROM predictions WHERE quest_id = $1 AND user_id = $2',
      [questId, req.user.userId]
    );

    res.json({ 
      quest: quest.rows[0],
      userBet: userBet.rows[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quest' });
  }
});

router.post('/quests/:questId/bet', authenticateToken, async (req, res) => {
  try {
    const { questId } = req.params;
    const { option, amount } = req.body;
    const userId = req.user.userId;

    // Validate
    if (!['a', 'b'].includes(option)) {
      return res.status(400).json({ error: 'Invalid option' });
    }

    if (amount < 10) {
      return res.status(400).json({ error: 'Minimum bet is 10 SATZ' });
    }

    // Check balance
    const user = await pool.query('SELECT satz_balance FROM users WHERE id = $1', [userId]);
    if (user.rows[0].satz_balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check quest is active and open
    const quest = await pool.query(
      'SELECT * FROM quests WHERE id = $1 AND status = $2 AND betting_deadline > NOW()',
      [questId, 'active']
    );
    if (quest.rows.length === 0) {
      return res.status(400).json({ error: 'Quest not available for betting' });
    }

    // Check if already bet
    const existingBet = await pool.query(
      'SELECT * FROM predictions WHERE quest_id = $1 AND user_id = $2',
      [questId, userId]
    );
    if (existingBet.rows.length > 0) {
      return res.status(400).json({ error: 'Already placed a bet on this quest' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Deduct balance
      await client.query(
        'UPDATE users SET satz_balance = satz_balance - $1 WHERE id = $2',
        [amount, userId]
      );

      // Create prediction
      await client.query(
        `INSERT INTO predictions (user_id, quest_id, selected_option, amount)
         VALUES ($1, $2, $3, $4)`,
        [userId, questId, option, amount]
      );

      // Update quest pool
      const poolColumn = option === 'a' ? 'pool_a' : 'pool_b';
      await client.query(
        `UPDATE quests SET ${poolColumn} = COALESCE(${poolColumn}, 0) + $1 WHERE id = $2`,
        [amount, questId]
      );

      // Record transaction
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, description)
         VALUES ($1, 'prediction_bet', $2, $3)`,
        [userId, -amount, `Bet on quest #${questId}`]
      );

      await client.query('COMMIT');
      res.json({ success: true, message: 'Bet placed successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Bet error:', error);
    res.status(500).json({ error: 'Failed to place bet' });
  }
});

router.get('/predictions', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT p.*, q.title, q.option_a, q.option_b, q.status as quest_status, q.winning_option
      FROM predictions p
      JOIN quests q ON p.quest_id = q.id
      WHERE p.user_id = $1
    `;
    const params = [req.user.userId];

    if (status) {
      query += ` AND q.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ predictions: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// ============================================
// EARN ENDPOINTS
// ============================================

router.get('/earn/daily', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get last login and streak
    const login = await pool.query(
      `SELECT * FROM daily_logins WHERE user_id = $1 ORDER BY login_date DESC LIMIT 1`,
      [userId]
    );

    const today = new Date().toISOString().split('T')[0];
    const lastLogin = login.rows[0];
    
    let currentStreak = 0;
    let canClaim = true;

    if (lastLogin) {
      const lastDate = new Date(lastLogin.login_date).toISOString().split('T')[0];
      
      if (lastDate === today) {
        canClaim = false;
        currentStreak = lastLogin.streak_count;
      } else {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastDate === yesterday) {
          currentStreak = lastLogin.streak_count;
        }
      }
    }

    const streakReward = getStreakReward(currentStreak + 1);

    res.json({
      canClaim,
      currentStreak,
      streakReward,
      nextStreakReward: getStreakReward(currentStreak + 2),
      weeklyBonus: (currentStreak + 1) % 7 === 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily reward' });
  }
});

router.post('/earn/daily/claim', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    // Check if already claimed
    const existing = await pool.query(
      `SELECT * FROM daily_logins WHERE user_id = $1 AND login_date = $2`,
      [userId, today]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already claimed today' });
    }

    // Get last login for streak
    const lastLogin = await pool.query(
      `SELECT * FROM daily_logins WHERE user_id = $1 ORDER BY login_date DESC LIMIT 1`,
      [userId]
    );

    let newStreak = 1;
    if (lastLogin.rows.length > 0) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const lastDate = new Date(lastLogin.rows[0].login_date).toISOString().split('T')[0];
      if (lastDate === yesterday) {
        newStreak = lastLogin.rows[0].streak_count + 1;
      }
    }

    const reward = getStreakReward(newStreak);
    let totalReward = reward;

    // Weekly bonus
    if (newStreak % 7 === 0) {
      totalReward += 500;
    }

    // Mystery box chance (10%)
    let mysteryBox = null;
    if (Math.random() < 0.1) {
      mysteryBox = Math.floor(Math.random() * 491) + 10; // 10-500
      totalReward += mysteryBox;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Record login
      await client.query(
        `INSERT INTO daily_logins (user_id, login_date, streak_count, reward)
         VALUES ($1, $2, $3, $4)`,
        [userId, today, newStreak, totalReward]
      );

      // Add balance
      await client.query(
        'UPDATE users SET satz_balance = satz_balance + $1, current_streak = $2, best_streak = GREATEST(best_streak, $2) WHERE id = $3',
        [totalReward, newStreak, userId]
      );

      // Record transaction
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, description)
         VALUES ($1, 'daily_login', $2, $3)`,
        [userId, totalReward, `Day ${newStreak} streak reward`]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        reward: totalReward,
        streak: newStreak,
        mysteryBox,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Claim error:', error);
    res.status(500).json({ error: 'Failed to claim daily reward' });
  }
});

router.post('/earn/spin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if user can spin (once per day, or via ad)
    // For now, allow one free spin per day
    const today = new Date().toISOString().split('T')[0];
    
    const lastSpin = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 AND type = 'spin_reward' AND DATE(created_at) = $2`,
      [userId, today]
    );

    if (lastSpin.rows.length > 0) {
      return res.status(400).json({ error: 'Already spun today. Watch an ad for another spin!' });
    }

    // Spin result (weighted)
    const outcomes = [
      { value: 10, weight: 30 },
      { value: 15, weight: 25 },
      { value: 20, weight: 20 },
      { value: 25, weight: 10 },
      { value: 30, weight: 8 },
      { value: 40, weight: 4 },
      { value: 50, weight: 2 },
      { value: 100, weight: 1 },
    ];

    const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
    let random = Math.random() * totalWeight;
    let reward = 10;

    for (const outcome of outcomes) {
      random -= outcome.weight;
      if (random <= 0) {
        reward = outcome.value;
        break;
      }
    }

    // Award
    await pool.query(
      'UPDATE users SET satz_balance = satz_balance + $1 WHERE id = $2',
      [reward, userId]
    );

    await pool.query(
      `INSERT INTO transactions (user_id, type, amount, description)
       VALUES ($1, 'spin_reward', $2, 'Daily spin wheel')`,
      [userId, reward]
    );

    res.json({ amount: reward, type: 'satz' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to spin' });
  }
});

router.get('/earn/tasks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const tasks = await pool.query(
      `SELECT c.*, 
        EXISTS(SELECT 1 FROM task_completions tc WHERE tc.campaign_id = c.id AND tc.user_id = $1) as completed
       FROM campaigns c 
       WHERE c.is_active = true AND c.remaining_budget > 0
       ORDER BY c.user_reward_satz DESC`,
      [userId]
    );

    res.json({ tasks: tasks.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/earn/tasks/:taskId/verify', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;

    // Check if already completed
    const existing = await pool.query(
      'SELECT * FROM task_completions WHERE campaign_id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Task already completed' });
    }

    // Get task
    const task = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND is_active = true',
      [taskId]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const reward = task.rows[0].user_reward_satz;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Mark completed
      await client.query(
        'INSERT INTO task_completions (campaign_id, user_id) VALUES ($1, $2)',
        [taskId, userId]
      );

      // Update campaign budget
      await client.query(
        'UPDATE campaigns SET remaining_budget = remaining_budget - $1, completions = completions + 1 WHERE id = $2',
        [reward, taskId]
      );

      // Award user
      await client.query(
        'UPDATE users SET satz_balance = satz_balance + $1 WHERE id = $2',
        [reward, userId]
      );

      // Transaction
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, description)
         VALUES ($1, 'task_reward', $2, $3)`,
        [userId, reward, task.rows[0].name]
      );

      await client.query('COMMIT');
      res.json({ success: true, reward });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify task' });
  }
});

router.post('/earn/watch-ad', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check daily limit (5 ads)
    const today = new Date().toISOString().split('T')[0];
    const adsToday = await pool.query(
      `SELECT COUNT(*) FROM transactions WHERE user_id = $1 AND type = 'ad_reward' AND DATE(created_at) = $2`,
      [userId, today]
    );

    if (parseInt(adsToday.rows[0].count) >= 5) {
      return res.status(400).json({ error: 'Daily ad limit reached' });
    }

    // Reward (20-50 SATZ random)
    const reward = Math.floor(Math.random() * 31) + 20;

    await pool.query(
      'UPDATE users SET satz_balance = satz_balance + $1 WHERE id = $2',
      [reward, userId]
    );

    await pool.query(
      `INSERT INTO transactions (user_id, type, amount, description)
       VALUES ($1, 'ad_reward', $2, 'Watched ad')`,
      [userId, reward]
    );

    res.json({ success: true, reward });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process ad reward' });
  }
});

// ============================================
// SOCIAL ENDPOINTS (Friends, Challenges, Groups)
// ============================================

router.get('/friends', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const friends = await pool.query(
      `SELECT u.id, u.username, u.first_name, u.last_name, u.tier,
        (SELECT COUNT(*) FROM predictions WHERE user_id = u.id AND is_winner = true) as predictions_won,
        (SELECT COUNT(*) FROM predictions WHERE user_id = u.id) as predictions_made
       FROM users u
       JOIN friendships f ON (f.friend_id = u.id AND f.user_id = $1) OR (f.user_id = u.id AND f.friend_id = $1)
       WHERE f.status = 'accepted' AND u.id != $1`,
      [userId]
    );

    // Calculate win rate
    const friendsWithStats = friends.rows.map(f => ({
      ...f,
      win_rate: f.predictions_made > 0 ? (f.predictions_won / f.predictions_made * 100) : 0
    }));

    res.json({ friends: friendsWithStats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

router.get('/friends/requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const requests = await pool.query(
      `SELECT u.id, u.username, u.first_name, u.last_name, f.id as request_id, f.created_at
       FROM users u
       JOIN friendships f ON f.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = 'pending'`,
      [userId]
    );

    res.json({ requests: requests.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.post('/friends/add', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.userId;

    // Find user
    const friend = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username.replace('@', '')]
    );

    if (friend.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friendId = friend.rows[0].id;

    if (friendId === userId) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }

    // Check existing
    const existing = await pool.query(
      'SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [userId, friendId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    await pool.query(
      'INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, $3)',
      [userId, friendId, 'pending']
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send request' });
  }
});

router.post('/friends/:friendId/accept', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    await pool.query(
      `UPDATE friendships SET status = 'accepted' 
       WHERE friend_id = $1 AND user_id = $2 AND status = 'pending'`,
      [userId, friendId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

router.post('/friends/:friendId/decline', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    await pool.query(
      'DELETE FROM friendships WHERE friend_id = $1 AND user_id = $2 AND status = $3',
      [userId, friendId, 'pending']
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to decline request' });
  }
});

// Challenges
router.get('/challenges', authenticateToken, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const userId = req.user.userId;

    const challenges = await pool.query(
      `SELECT fc.*, 
        json_build_object('id', u1.id, 'first_name', u1.first_name, 'username', u1.username) as challenger,
        json_build_object('id', u2.id, 'first_name', u2.first_name, 'username', u2.username) as challenged
       FROM friend_challenges fc
       JOIN users u1 ON fc.challenger_id = u1.id
       JOIN users u2 ON fc.challenged_id = u2.id
       WHERE (fc.challenger_id = $1 OR fc.challenged_id = $1) AND fc.status = $2
       ORDER BY fc.created_at DESC`,
      [userId, status]
    );

    res.json({ challenges: challenges.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Groups
router.get('/groups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const groups = await pool.query(
      `SELECT pg.*, 
        (SELECT COUNT(*) FROM group_members WHERE group_id = pg.id) as member_count,
        (SELECT COUNT(*) FROM quests WHERE group_id = pg.id AND status = 'active') as active_quests,
        gm.role as your_role
       FROM prediction_groups pg
       JOIN group_members gm ON gm.group_id = pg.id AND gm.user_id = $1
       ORDER BY pg.created_at DESC`,
      [userId]
    );

    res.json({ groups: groups.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// ============================================
// VAULT ENDPOINTS
// ============================================

router.get('/vault', authenticateToken, async (req, res) => {
  try {
    const vault = await pool.query('SELECT * FROM btc_vault ORDER BY id DESC LIMIT 1');
    const stats = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END), 0) as total_inflow,
        COALESCE(SUM(CASE WHEN type = 'redemption' THEN amount ELSE 0 END), 0) as total_outflow
      FROM vault_transactions
    `);
    
    const circulating = await pool.query('SELECT COALESCE(SUM(satz_balance), 0) as total FROM users');

    const vaultData = vault.rows[0] || { balance_satoshis: 0 };
    const btcBalance = vaultData.balance_satoshis / 100000000;

    res.json({
      vault: {
        balance_satoshis: vaultData.balance_satoshis,
        balance_btc: btcBalance,
        usd_value: btcBalance * 100000, // Approximate, should fetch real price
        total_inflow: stats.rows[0].total_inflow,
        total_outflow: stats.rows[0].total_outflow,
        circulating_satz: circulating.rows[0].total,
        satz_to_satoshi_rate: vaultData.balance_satoshis / Math.max(1, circulating.rows[0].total),
        progress_1btc: (btcBalance / 1) * 100,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vault' });
  }
});

// ============================================
// LEADERBOARD
// ============================================

router.get('/leaderboard/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { period = 'weekly' } = req.query;
    const userId = req.user.userId;

    let dateFilter = '';
    switch (period) {
      case 'daily':
        dateFilter = "AND p.created_at >= CURRENT_DATE";
        break;
      case 'weekly':
        dateFilter = "AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'monthly':
        dateFilter = "AND p.created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      default:
        dateFilter = '';
    }

    let query;
    if (type === 'streaks') {
      query = `
        SELECT u.id, u.first_name, u.username, u.tier, u.current_streak,
          ROW_NUMBER() OVER (ORDER BY u.current_streak DESC) as rank
        FROM users u
        WHERE u.current_streak > 0
        ORDER BY u.current_streak DESC
        LIMIT 50
      `;
    } else {
      query = `
        SELECT u.id, u.first_name, u.username, u.tier,
          COUNT(p.id) as predictions_made,
          COUNT(CASE WHEN p.is_winner THEN 1 END) as predictions_won,
          COALESCE(SUM(CASE WHEN p.is_winner THEN p.payout ELSE 0 END), 0) as total_won,
          u.current_streak,
          ROW_NUMBER() OVER (ORDER BY COUNT(CASE WHEN p.is_winner THEN 1 END) DESC) as rank
        FROM users u
        LEFT JOIN predictions p ON p.user_id = u.id ${dateFilter}
        GROUP BY u.id
        HAVING COUNT(p.id) > 0
        ORDER BY predictions_won DESC
        LIMIT 50
      `;
    }

    const result = await pool.query(query);

    // Calculate win rates
    const leaderboard = result.rows.map(row => ({
      ...row,
      win_rate: row.predictions_made > 0 ? (row.predictions_won / row.predictions_made * 100) : 0
    }));

    // Get user's rank
    const userRank = leaderboard.findIndex(u => u.id === userId);

    res.json({
      leaderboard,
      userRank: userRank >= 0 ? { rank: userRank + 1, total: leaderboard.length } : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getStreakReward(day) {
  const rewards = { 1: 25, 2: 50, 3: 100, 4: 150, 5: 250, 6: 400, 7: 750 };
  return rewards[Math.min(day, 7)] || rewards[7];
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

module.exports = router;
