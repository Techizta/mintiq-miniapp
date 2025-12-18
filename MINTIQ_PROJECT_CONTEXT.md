# MintIQ - Complete Project Context & Implementation Guide
## Master Reference Document for AI-Assisted Development

**Version:** 2.0
**Last Updated:** December 2024
**Purpose:** Comprehensive project context for Claude/AI assistants

---

# TABLE OF CONTENTS

1. [Product Overview](#1-product-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [Database Schema](#3-database-schema)
4. [Bot Features & Handlers](#4-bot-features--handlers)
5. [Services Layer](#5-services-layer)
6. [Advertiser Self-Serve Portal](#6-advertiser-self-serve-portal)
7. [Auto Quest Engine](#7-auto-quest-engine)
8. [SATZ Tokenomics](#8-satz-tokenomics)
9. [BTC Vault System](#9-btc-vault-system)
10. [Admin Dashboard](#10-admin-dashboard)
11. [API Endpoints Reference](#11-api-endpoints-reference)
12. [Mini App Specification](#12-mini-app-specification)
13. [Engagement & Retention Systems](#13-engagement--retention-systems)
14. [Revenue Model](#14-revenue-model)
15. [Viral Mechanics & Messaging](#15-viral-mechanics--messaging)
16. [Deployment & Infrastructure](#16-deployment--infrastructure)
17. [Implementation Roadmap](#17-implementation-roadmap)

---

# 1. PRODUCT OVERVIEW

## What is MintIQ?

MintIQ is a **Telegram-based prediction platform** where users earn SATZ tokens by making correct predictions on crypto prices, sports, politics, and more. SATZ tokens are backed by real Bitcoin in a transparent vault and can be redeemed for BTC.

## Brand Identity

| Attribute | Value |
|-----------|-------|
| **Name** | MintIQ ("Mint" = create value + "IQ" = intelligence) |
| **Tagline** | Predict. Earn. Connect. |
| **Primary Color** | #0066FF (Electric Blue) |
| **Accent Color** | #FFD700 (Gold) |
| **Bot Username** | @MintIQBot |
| **Website** | mintiq.world |
| **API Domain** | api.mintiq.world |
| **Mini App** | app.mintiq.world |

## Five Stakeholder Groups

| Stakeholder | Contribution | Reward | Platform Benefit |
|-------------|--------------|--------|------------------|
| **Users** | Predictions, tasks, referrals | SATZ → BTC | Activity fees |
| **Creators** | Group quests | 2% of group volume | Content |
| **Influencers** | Referrals | 7% lifetime commission | Growth |
| **Advertisers** | Campaign spend (USD) | Verified engagement | Revenue |
| **Investors** | Capital | Vault appreciation | Growth capital |

## Core Value Proposition

> "Your predictions become real Bitcoin. Not points, not promises - actual BTC you can withdraw."

## The MintIQ Flywheel

```
Users predict → Treasury grows → BTC Vault increases → SATZ more valuable
    ↑                                                           ↓
    └──── More users want to join ←── More advertisers ←────────┘
```

---

# 2. TECHNICAL ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CLIENTS                                                       │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│   │ Telegram Bot │ │ Mini App     │ │ Advertiser   │          │
│   │ @MintIQBot   │ │ (React)      │ │ Portal       │          │
│   └──────┬───────┘ └──────┬───────┘ └──────┬───────┘          │
│          │                │                │                    │
│          └────────────────┼────────────────┘                    │
│                           │                                     │
│                           ▼                                     │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              API SERVER (Express.js)                     │  │
│   │              api.mintiq.world:3002                       │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │  /api/advertiser/*  │  /api/user/*  │  /api/admin/*     │  │
│   │  /api/miniapp/*     │  /api/redemption/*                │  │
│   └──────────────────────────┬──────────────────────────────┘  │
│                              │                                  │
│          ┌───────────────────┼───────────────────┐             │
│          ▼                   ▼                   ▼             │
│   ┌────────────┐     ┌────────────┐     ┌────────────┐        │
│   │ PostgreSQL │     │   Redis    │     │ CoinGecko  │        │
│   │   (RDS)    │     │  (Cache)   │     │    API     │        │
│   └────────────┘     └────────────┘     └────────────┘        │
│                                                                 │
│   EXTERNAL SERVICES                                            │
│   ┌────────────┐     ┌────────────┐     ┌────────────┐        │
│   │ NOWPayments│     │  Telegram  │     │  AWS SES   │        │
│   │ (Payouts)  │     │  Bot API   │     │  (Email)   │        │
│   └────────────┘     └────────────┘     └────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Bot** | Node.js + Telegraf | Telegram bot framework |
| **API** | Express.js | REST API server |
| **Website** | Next.js 14 + Tailwind | Advertiser portal, landing pages |
| **Mini App** | React + Vite + TWA SDK | User-facing Telegram Mini App |
| **Database** | PostgreSQL (AWS RDS) | Primary data store |
| **Cache** | Redis | Session, rate limiting, caching |
| **Payments** | NOWPayments API | Crypto deposits/withdrawals |
| **Email** | AWS SES + Nodemailer | OTP, notifications |
| **Hosting** | AWS EC2 + Vercel | Bot on EC2, web on Vercel |
| **Ads** | Adsgram | Rewarded video ads |

## Repository Structure

### Bot Repository (mintiq-bot)
```
mintiq-bot/
├── src/
│   ├── index.js              # Main entry, Express + Bot setup
│   ├── config.js             # Environment config
│   ├── handlers/
│   │   ├── start.js          # /start command
│   │   ├── menu.js           # Main menu, stats
│   │   ├── predict.js        # Quest browsing, betting
│   │   ├── earn.js           # Daily rewards, tasks
│   │   ├── social.js         # Friends, challenges, groups
│   │   ├── wallet.js         # Balance, transactions
│   │   ├── vault.js          # BTC vault display
│   │   ├── settings.js       # User preferences
│   │   ├── booster.js        # Earnings multipliers
│   │   ├── shop.js           # Customization shop
│   │   └── admin.js          # Admin panel
│   ├── services/
│   │   ├── database.js       # PostgreSQL pool
│   │   ├── redis.js          # Redis client
│   │   ├── userService.js    # User operations
│   │   ├── questService.js   # Quest operations
│   │   ├── socialService.js  # Friends, groups
│   │   ├── taskService.js    # Task verification
│   │   ├── advertiserService.js  # Advertiser ops
│   │   ├── vaultService.js   # BTC vault
│   │   ├── engagementEngine.js   # Streaks, rewards
│   │   ├── autoQuestEngine.js    # Auto generation
│   │   ├── notificationService.js # Push notifications
│   │   ├── nowPaymentsService.js  # Crypto payments
│   │   ├── otpService.js     # Email OTP
│   │   ├── emailService.js   # Email sending
│   │   └── treasuryService.js # Fee processing
│   └── routes/
│       ├── advertiser.js     # Advertiser API routes
│       └── admin.js          # Admin API routes
├── package.json
└── .env
```

### Website Repository (mintiq-web)
```
mintiq-web/
├── src/
│   ├── app/
│   │   ├── page.jsx              # Homepage
│   │   ├── layout.jsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── vault/
│   │   │   └── page.jsx          # BTC Vault page
│   │   ├── affiliates/
│   │   │   └── page.jsx          # Affiliate landing
│   │   ├── advertisers/
│   │   │   └── page.jsx          # Advertiser landing
│   │   ├── affiliate/
│   │   │   └── dashboard/
│   │   │       └── page.jsx      # Affiliate portal
│   │   └── advertiser/
│   │       ├── login/
│   │       │   └── page.jsx      # OTP login
│   │       ├── register/
│   │       │   └── page.jsx      # Signup
│   │       ├── dashboard/
│   │       │   └── page.jsx      # Main dashboard
│   │       ├── campaigns/
│   │       │   ├── new/
│   │       │   │   └── page.jsx  # Create campaign
│   │       │   └── [id]/
│   │       │       └── page.jsx  # Campaign details
│   │       ├── deposit/
│   │       │   └── page.jsx      # Add funds
│   │       └── billing/
│   │           └── deposit/
│   │               └── page.jsx  # Payment flow
│   └── components/               # Shared components
├── package.json
└── .env.local
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/mintiq

# Telegram
TELEGRAM_BOT_TOKEN=xxxx:xxxx
BOT_USERNAME=MintIQBot

# Authentication
JWT_SECRET=your-secret-key
INTERNAL_API_SECRET=your-internal-secret

# NOWPayments
NOWPAYMENTS_API_KEY=xxx
NOWPAYMENTS_IPN_SECRET=xxx
NOWPAYMENTS_PAYOUT_API_KEY=xxx

# AWS SES (Email)
SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SES_SMTP_PORT=587
SES_SMTP_USER=your-ses-smtp-user
SES_SMTP_PASS=your-ses-smtp-password
EMAIL_FROM=noreply@mintiq.world

# Admin
ADMIN_IDS=123456789,987654321

# Redis
REDIS_URL=redis://localhost:6379

# URLs
API_URL=https://api.mintiq.world
WEB_URL=https://mintiq.world
```

---

# 3. DATABASE SCHEMA

## Core Tables

### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'en',
    
    -- Balances
    satz_balance BIGINT DEFAULT 0,
    total_earned BIGINT DEFAULT 0,
    total_spent BIGINT DEFAULT 0,
    total_won BIGINT DEFAULT 0,
    
    -- Stats
    predictions_made INTEGER DEFAULT 0,
    predictions_won INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    current_win_streak INTEGER DEFAULT 0,
    best_win_streak INTEGER DEFAULT 0,
    
    -- Streaks
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    
    -- Tiers
    tier VARCHAR(50) DEFAULT 'novice',
    tier_points INTEGER DEFAULT 0,
    
    -- Referrals
    referrer_id INTEGER REFERENCES users(id),
    referral_code VARCHAR(20) UNIQUE,
    referral_count INTEGER DEFAULT 0,
    
    -- Settings
    notifications_enabled BOOLEAN DEFAULT true,
    win_broadcasts_enabled BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    
    -- Timestamps
    last_active_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-generate referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    WHEN (NEW.referral_code IS NULL)
    EXECUTE FUNCTION generate_referral_code();
```

### quests
```sql
CREATE TABLE quests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'other', -- crypto, sports, politics, other
    
    -- Options
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    
    -- Pools
    pool_a BIGINT DEFAULT 0,
    pool_b BIGINT DEFAULT 0,
    total_pool BIGINT DEFAULT 0,
    participant_count INTEGER DEFAULT 0,
    
    -- Timing
    betting_deadline TIMESTAMP NOT NULL,
    resolution_date TIMESTAMP NOT NULL,
    
    -- Resolution
    status VARCHAR(50) DEFAULT 'active', -- active, closed, resolved, cancelled
    winning_option CHAR(1),
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100),
    
    -- Metadata for auto-resolution
    metadata JSONB,
    
    -- Sponsorship
    sponsor_id INTEGER,
    is_sponsored BOOLEAN DEFAULT false,
    
    -- Groups
    group_id INTEGER,
    creator_id INTEGER,
    created_by VARCHAR(100) DEFAULT 'system',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### predictions
```sql
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    quest_id INTEGER NOT NULL REFERENCES quests(id),
    chosen_option CHAR(1) NOT NULL, -- 'a' or 'b'
    amount BIGINT NOT NULL,
    is_winner BOOLEAN,
    payout BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, quest_id)
);
```

### friendships
```sql
CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    friend_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted
    created_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    UNIQUE(user_id, friend_id)
);
```

### friend_challenges
```sql
CREATE TABLE friend_challenges (
    id SERIAL PRIMARY KEY,
    challenger_id INTEGER NOT NULL REFERENCES users(id),
    challenged_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    stake_amount BIGINT NOT NULL,
    challenger_position VARCHAR(10),
    challenged_position VARCHAR(10),
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, resolved, cancelled, expired
    winner_id INTEGER REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### prediction_groups
```sql
CREATE TABLE prediction_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    invite_code VARCHAR(20) UNIQUE,
    is_private BOOLEAN DEFAULT true,
    member_count INTEGER DEFAULT 0,
    max_members INTEGER DEFAULT 100,
    admin_earnings BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### group_members
```sql
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES prediction_groups(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member', -- member, admin
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);
```

### advertisers
```sql
CREATE TABLE advertisers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    website VARCHAR(500),
    balance_usd DECIMAL(12,2) DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    api_key VARCHAR(64) UNIQUE,
    status VARCHAR(50) DEFAULT 'active', -- active, suspended
    created_at TIMESTAMP DEFAULT NOW()
);
```

### campaigns
```sql
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    advertiser_id INTEGER NOT NULL REFERENCES advertisers(id),
    name VARCHAR(255) NOT NULL,
    task_type VARCHAR(50) NOT NULL, -- channel_join, website_visit, twitter_follow
    description TEXT,
    
    -- Targeting
    target_url VARCHAR(500),
    target_channel VARCHAR(255),
    required_seconds INTEGER DEFAULT 30,
    targeting JSONB DEFAULT '{}',
    
    -- Budget
    budget_usd DECIMAL(12,2) NOT NULL,
    spent_usd DECIMAL(12,2) DEFAULT 0,
    price_per_completion DECIMAL(8,4) NOT NULL,
    user_reward_satz INTEGER NOT NULL,
    
    -- Limits
    target_completions INTEGER,
    total_completions INTEGER DEFAULT 0,
    daily_limit INTEGER,
    
    -- Retention tracking
    retention_24h INTEGER DEFAULT 0,
    retention_7d INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, paused, completed, archived
    created_at TIMESTAMP DEFAULT NOW()
);
```

### task_completions
```sql
CREATE TABLE task_completions (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(50),
    verification_data JSONB,
    reward_satz INTEGER,
    rewarded_at TIMESTAMP,
    still_member_24h BOOLEAN,
    checked_24h_at TIMESTAMP,
    still_member_7d BOOLEAN,
    checked_7d_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);
```

### btc_vault
```sql
CREATE TABLE btc_vault (
    id SERIAL PRIMARY KEY,
    balance_satoshis BIGINT DEFAULT 0,
    balance_btc DECIMAL(18,8) DEFAULT 0,
    usd_value DECIMAL(18,2) DEFAULT 0,
    total_inflow BIGINT DEFAULT 0,
    total_outflow BIGINT DEFAULT 0,
    total_burned_satz BIGINT DEFAULT 0,
    circulating_satz BIGINT DEFAULT 0,
    satz_to_satoshi_rate DECIMAL(18,12) DEFAULT 0.000001,
    last_updated TIMESTAMP DEFAULT NOW()
);
```

### vault_transactions
```sql
CREATE TABLE vault_transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- inflow, outflow
    amount_satoshis BIGINT NOT NULL,
    source VARCHAR(100),
    reference_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### daily_logins
```sql
CREATE TABLE daily_logins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    login_date DATE NOT NULL,
    streak_day INTEGER DEFAULT 1,
    reward_satz INTEGER,
    mystery_box_won BOOLEAN DEFAULT false,
    mystery_box_amount INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, login_date)
);
```

### transactions
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    balance_after BIGINT,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### advertiser_deposits
```sql
CREATE TABLE advertiser_deposits (
    id SERIAL PRIMARY KEY,
    advertiser_id INTEGER NOT NULL REFERENCES advertisers(id),
    amount_usd DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    pay_address VARCHAR(255),
    pay_amount DECIMAL(18,8),
    pay_currency VARCHAR(10),
    payment_data JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    actual_amount_paid DECIMAL(12,2),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### otp_codes
```sql
CREATE TABLE otp_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### system_config
```sql
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Default values
INSERT INTO system_config (key, value, description) VALUES
    ('welcome_bonus_satz', '500', 'Welcome bonus for new users'),
    ('referral_bonus_referrer', '50', 'Bonus for referrer'),
    ('referral_bonus_referee', '100', 'Bonus for referee'),
    ('daily_login_base', '25', 'Base daily login reward'),
    ('mystery_box_min', '10', 'Minimum mystery box reward'),
    ('mystery_box_max', '500', 'Maximum mystery box reward'),
    ('mystery_box_chance', '10', 'Mystery box chance percentage'),
    ('min_redemption_satz', '100000', 'Minimum SATZ for redemption'),
    ('redemption_fee_percent', '2', 'Redemption fee percentage'),
    ('first_task_bonus_satz', '500', 'Bonus for completing first task'),
    ('treasury_fee_rate', '0.10', 'Treasury fee from prediction pools'),
    ('vault_share_rate', '0.50', 'Vault share of treasury'),
    ('referral_commission_rate', '0.07', 'Lifetime referral commission rate')
ON CONFLICT (key) DO NOTHING;
```

---

# 4. BOT FEATURES & HANDLERS

## Command Handlers

| Command | Handler | Description |
|---------|---------|-------------|
| `/start` | startHandler | Welcome, referral processing |
| `/menu` | menuHandler.showMainMenu | Main menu |
| `/predict` | predictHandler.showActiveQuests | Browse predictions |
| `/earn` | earnHandler.showEarnMenu | Daily rewards, tasks |
| `/friends` | socialHandler.showFriends | Friends, challenges, groups |
| `/wallet` | walletHandler.showWallet | Balance, transactions |
| `/vault` | vaultHandler.showVault | BTC vault status |
| `/redeem` | walletHandler.showRedemption | SATZ → BTC redemption |
| `/stats` | menuHandler.showStats | User statistics |
| `/leaderboard` | menuHandler.showLeaderboard | Rankings |
| `/settings` | settingsHandler.showSettings | Preferences |
| `/boost` | boosterHandler.showBoosterMenu | Earnings boosters |
| `/shop` | shopHandler.showShopMenu | Customization shop |
| `/admin` | adminHandler.showAdminPanel | Admin panel (restricted) |

## Callback Action Patterns

```javascript
// Predictions
bot.action(/^quest_(\d+)$/, predictHandler.showQuestDetails);
bot.action(/^bet_(\d+)_(a|b)$/, predictHandler.selectBetAmount);
bot.action(/^confirm_bet_(\d+)_(a|b)_(\d+)$/, predictHandler.confirmBet);
bot.action('my_predictions', predictHandler.showMyPredictions);

// Earn
bot.action('daily_login', earnHandler.claimDailyLogin);
bot.action('earn_tasks', earnHandler.showTasks);
bot.action(/^task_(\d+)$/, earnHandler.showTaskDetails);
bot.action(/^start_task_(\d+)$/, earnHandler.startTask);
bot.action(/^verify_task_(\d+)$/, earnHandler.verifyTask);

// Social
bot.action('menu_friends', socialHandler.showFriends);
bot.action('add_friend', socialHandler.promptAddFriend);
bot.action('list_friends', socialHandler.listFriends);
bot.action('friend_requests', socialHandler.showFriendRequests);
bot.action(/^accept_friend_(\d+)$/, socialHandler.acceptFriend);
bot.action(/^decline_friend_(\d+)$/, socialHandler.declineFriend);

// Challenges
bot.action('create_challenge', socialHandler.createChallenge);
bot.action(/^challenge_friend_(\d+)$/, socialHandler.selectFriendForChallenge);
bot.action('my_challenges', socialHandler.showMyChallenges);
bot.action(/^accept_challenge_(\d+)$/, socialHandler.acceptChallenge);
bot.action(/^decline_challenge_(\d+)$/, socialHandler.declineChallenge);

// Groups
bot.action('my_groups', socialHandler.showMyGroups);
bot.action('create_group', socialHandler.createGroup);
bot.action('join_group', socialHandler.joinGroup);
bot.action(/^group_(\d+)$/, socialHandler.showGroupDetails);
bot.action(/^group_quests_(\d+)$/, socialHandler.showGroupQuests);
bot.action(/^group_admin_(\d+)$/, socialHandler.showGroupAdminPanel);

// Admin
bot.action('admin_panel', adminHandler.showAdminPanel);
bot.action('admin_dashboard', adminHandler.showDashboard);
bot.action('admin_users', adminHandler.showUserManagement);
bot.action('admin_quests', adminHandler.showQuestManagement);
bot.action('admin_vault', adminHandler.showVaultManagement);
bot.action('admin_broadcast', adminHandler.showBroadcastMenu);
```

---

# 5. SERVICES LAYER

## Key Service Methods

### userService.js
```javascript
class UserService {
  // User management
  async findOrCreate(telegramUser, referrerCode)
  async getUserById(userId)
  async getUserByTelegramId(telegramId)
  async updateLastActive(userId)
  
  // Balance operations
  async addSatz(userId, amount, type, description)
  async deductSatz(userId, amount, type, description)
  async getBalance(userId)
  
  // Stats
  async updateWinRate(userId)
  async updateTier(userId)
  
  // Config
  async getConfig()
  async getConfigValue(key)
}
```

### questService.js
```javascript
class QuestService {
  // Quest operations
  async getActiveQuests(category, limit)
  async getQuestById(questId)
  async createQuest(questData)
  
  // Betting
  async placeBet(userId, questId, option, amount)
  async getUserPrediction(userId, questId)
  async getMyPredictions(userId, status)
  
  // Resolution
  async resolveQuest(questId, winningOption, resolvedBy)
  async calculatePayout(pool, betAmount, winningPool)
  async distributePayouts(questId)
}
```

### socialService.js
```javascript
class SocialService {
  // Friends
  async sendFriendRequest(userId, friendUsername)
  async acceptFriendRequest(userId, requesterId)
  async declineFriendRequest(userId, requesterId)
  async getFriends(userId)
  async getPendingRequests(userId)
  
  // Challenges
  async createChallenge(challengerId, challengedId, data)
  async acceptChallenge(challengeId, userId)
  async declineChallenge(challengeId, userId)
  async resolveChallenge(challengeId, winnerId)
  async getPendingChallenges(userId)
  async getMyChallenges(userId)
  
  // Groups
  async createGroup(adminId, name, description)
  async joinGroup(userId, inviteCode)
  async leaveGroup(userId, groupId)
  async getMyGroups(userId)
  async getGroupDetails(groupId)
  async getGroupMembers(groupId)
  async getGroupQuests(groupId)
  async createGroupQuest(groupId, adminId, questData)
  async resolveGroupQuest(questId, adminId, winningOption)
  async distributeGroupAdminEarnings(groupId, feeAmount)
}
```

### taskService.js
```javascript
class TaskService {
  // Task operations
  async getAvailableTasks(userId, limit)
  async getTaskDetails(taskId)
  async startTask(userId, taskId)
  
  // Verification
  async verifyChannelJoin(userId, taskId, bot)
  async verifyWebsiteVisit(userId, taskId, duration)
  async verifyTwitterFollow(userId, taskId)
  
  // Completion
  async completeTask(userId, taskId, verificationData)
  async hasCompletedTask(userId, taskId)
}
```

### engagementEngine.js
```javascript
class EngagementEngine {
  // Daily rewards
  async claimDailyReward(userId)
  async getStreakInfo(userId)
  async calculateStreakReward(streakDay, tier)
  
  // Tiers
  calculateTier(tierPoints)
  getTierMultiplier(tier)
  async updateUserTier(userId)
  
  // Mystery boxes
  async awardMysteryBox(userId, trigger)
  async getMysteryBoxReward(tier)
  
  // Win streaks
  async processWinStreak(userId)
  async resetWinStreak(userId)
  
  // Referral commission
  async processReferralCommission(userId, amount, source)
  
  // Economics
  async getEconomicsReport()
  startScheduler()
}
```

### vaultService.js
```javascript
class VaultService {
  // Vault status
  async getVaultStatus()
  async updateVaultStats()
  
  // Treasury processing
  async processTreasuryFee(feeAmount, source, referenceId, groupId)
  
  // Redemption
  async calculateRedemption(satzAmount)
  async canRedeem(userId)
  async processRedemption(userId, satzAmount, btcAddress)
}
```

---

# 6. ADVERTISER SELF-SERVE PORTAL

## Portal Overview

The advertiser portal at `mintiq.world/advertiser` allows businesses to create and manage task campaigns.

## Authentication Flow

```
1. New Advertiser Registration:
   POST /api/advertiser/auth/register
   Body: { email, companyName }
   → Creates account, sends OTP

2. Login (Existing):
   POST /api/advertiser/auth/request-otp
   Body: { email }
   → Sends 6-digit OTP to email

3. Verify OTP:
   POST /api/advertiser/auth/verify-otp
   Body: { email, code }
   → Returns JWT token (7 days validity)

4. All subsequent requests:
   Header: Authorization: Bearer <jwt_token>
```

## Portal Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/advertiser/login` | LoginPage | OTP-based login |
| `/advertiser/register` | RegisterPage | New account signup |
| `/advertiser/dashboard` | DashboardPage | Main dashboard |
| `/advertiser/campaigns/new` | NewCampaignPage | Create campaign |
| `/advertiser/campaigns/[id]` | CampaignDetailPage | Campaign details & stats |
| `/advertiser/deposit` | DepositPage | Add funds (crypto) |
| `/advertiser/billing/deposit` | BillingDepositPage | Payment flow |

## Dashboard Data Structure

```javascript
// GET /api/advertiser/dashboard response:
{
  advertiser: {
    id: 123,
    email: "business@example.com",
    companyName: "Crypto Project",
    balance: 847.50,
    totalSpent: 1234.00,
    createdAt: "2024-01-15"
  },
  campaigns: [
    {
      id: 1,
      name: "Join Our Channel",
      taskType: "channel_join",
      status: "active",
      budget: 500,
      spent: 234.50,
      completions: 4690,
      targetCompletions: 10000,
      pricePerCompletion: 0.05,
      userRewardSatz: 100,
      progressPct: 46.9
    }
  ],
  stats: {
    totalCampaigns: 5,
    activeCampaigns: 2,
    totalCompletions: 12450,
    totalSpent: 622.50
  },
  platformStats: {
    totalUsers: 15234,
    activeUsers24h: 3421,
    completions24h: 847,
    avgRetention24h: 68.5
  },
  pagination: {
    page: 1,
    limit: 10,
    totalCampaigns: 5,
    totalPages: 1,
    hasMore: false
  }
}
```

## Campaign Types & Templates

```javascript
const CAMPAIGN_TEMPLATES = [
  {
    id: 'telegram_channel',
    name: 'Telegram Channel Join',
    taskType: 'channel_join',
    description: 'Users join your Telegram channel. Auto-verified via API.',
    icon: '📢',
    suggestedReward: 100,  // SATZ
    suggestedPrice: 0.05,  // USD
    avgRetention: '45%',
    fields: ['targetChannel'],
    verificationMethod: 'telegram_api',
    popular: true
  },
  {
    id: 'website_visit',
    name: 'Website Visit',
    taskType: 'website_visit',
    description: 'Users visit your website for minimum time.',
    icon: '🌐',
    suggestedReward: 75,
    suggestedPrice: 0.03,
    avgRetention: 'N/A',
    fields: ['targetUrl', 'requiredSeconds'],
    verificationMethod: 'time_tracking'
  },
  {
    id: 'twitter_follow',
    name: 'Twitter/X Follow',
    taskType: 'twitter_follow',
    description: 'Users follow your Twitter account.',
    icon: '🐦',
    suggestedReward: 200,
    suggestedPrice: 0.10,
    avgRetention: '60%',
    fields: ['targetUrl'],
    verificationMethod: 'twitter_api'
  }
];
```

## Campaign Creation Flow

```javascript
// POST /api/advertiser/campaigns
// Request:
{
  name: "Join Our Telegram",
  taskType: "channel_join",
  description: "Join for news and updates",
  targetChannel: "@mychannel",
  budgetUsd: 100,
  pricePerCompletion: 0.05,
  dailyLimit: 50
}

// Server-side validation:
// 1. Check taskType is valid
// 2. Check minimum budget ($10)
// 3. Check advertiser has sufficient balance
// 4. Auto-set userRewardSatz from template
// 5. Deduct budget from balance
// 6. Create campaign
// 7. Notify active users (optional)

// Response:
{
  success: true,
  campaign: {
    id: 456,
    name: "Join Our Telegram",
    status: "active",
    userRewardSatz: 100
  }
}
```

## Deposit Flow (NOWPayments)

```javascript
// 1. Create deposit
// POST /api/advertiser/deposits/crypto
{
  amount: 100,      // USD
  currency: "btc"   // or usdt, eth, etc.
}

// Response:
{
  success: true,
  paymentId: "5912345678",
  payAddress: "bc1q...",
  payAmount: 0.00095,
  payCurrency: "btc",
  expiresAt: "2024-12-17T12:00:00Z",
  orderId: 789
}

// 2. User pays to address
// 3. NOWPayments sends IPN webhook
// POST /api/webhooks/nowpayments

// 4. Webhook handler:
if (status === 'finished' || status === 'confirmed') {
  // Credit advertiser balance
  // Update deposit status
  // Send confirmation email
}
```

## Task Verification Methods

### Channel Join (Telegram API)
```javascript
async verifyChannelJoin(userId, taskId, bot) {
  const task = await this.getTaskDetails(taskId);
  const user = await db.query('SELECT telegram_id FROM users WHERE id = $1', [userId]);
  
  const channelUsername = task.target_channel.replace('@', '');
  const member = await bot.telegram.getChatMember(`@${channelUsername}`, user.telegram_id);
  
  const validStatuses = ['member', 'administrator', 'creator'];
  return validStatuses.includes(member.status);
}
```

### Website Visit (Timer)
```javascript
// Frontend tracks time on target URL
// Backend verifies session:
async verifyWebsiteVisit(userId, taskId, visitData) {
  const task = await this.getTaskDetails(taskId);
  const requiredSeconds = task.required_seconds || 30;
  
  // Verify duration from session
  return visitData.duration >= requiredSeconds * 1000;
}
```

## Retention Tracking

```javascript
// 24-hour check (runs via cron)
async check24hRetention() {
  const completions = await db.query(`
    SELECT tc.*, c.target_channel, u.telegram_id
    FROM task_completions tc
    JOIN campaigns c ON tc.campaign_id = c.id
    JOIN users u ON tc.user_id = u.id
    WHERE tc.created_at < NOW() - INTERVAL '24 hours'
      AND tc.checked_24h_at IS NULL
      AND c.task_type = 'channel_join'
  `);
  
  for (const completion of completions.rows) {
    const stillMember = await this.verifyChannelJoin(completion.user_id, completion.campaign_id);
    await db.query(`
      UPDATE task_completions 
      SET still_member_24h = $1, checked_24h_at = NOW()
      WHERE id = $2
    `, [stillMember, completion.id]);
    
    // Update campaign retention stats
    if (stillMember) {
      await db.query(`
        UPDATE campaigns SET retention_24h = retention_24h + 1 WHERE id = $1
      `, [completion.campaign_id]);
    }
  }
}
```

---

# 7. AUTO QUEST ENGINE

## Overview

Automatically generates and resolves crypto prediction quests using CoinGecko API (free tier).

## Supported Coins

```javascript
const SUPPORTED_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon' }
];
```

## Quest Types

```javascript
const QUEST_TEMPLATES = {
  crypto_price: {
    category: 'crypto',
    titleTemplate: 'Will {coin} be above ${price} at {time}?',
    optionA: 'Yes, above',
    optionB: 'No, below',
    // Metadata for resolution
    metadata: {
      type: 'crypto_price',
      coinId: 'bitcoin',
      targetPrice: 105000,
      direction: 'above'
    }
  },
  
  crypto_change: {
    category: 'crypto',
    titleTemplate: 'Will {coin} gain more than {percent}% in {hours} hours?',
    optionA: 'Yes',
    optionB: 'No',
    metadata: {
      type: 'crypto_change',
      coinId: 'ethereum',
      targetPercent: 3,
      startPrice: 4000
    }
  },
  
  crypto_direction: {
    category: 'crypto',
    titleTemplate: 'Will {coin} close GREEN today?',
    optionA: 'Yes, Green',
    optionB: 'No, Red',
    metadata: {
      type: 'crypto_direction',
      coinId: 'solana'
    }
  }
};
```

## Generation Schedule

```javascript
// Runs every 6 hours
async generateDailyQuests() {
  // 1. Fetch top cryptos from CoinGecko
  const cryptos = await this.getTopCryptos(10);
  
  // 2. Generate diverse quest types
  const quests = [];
  
  // Price target quests (2-3)
  for (const crypto of cryptos.slice(0, 3)) {
    const targetPrice = this.calculateTargetPrice(crypto.current_price);
    quests.push(this.createPriceQuest(crypto, targetPrice));
  }
  
  // Percentage change quests (2)
  for (const crypto of cryptos.slice(3, 5)) {
    quests.push(this.createChangeQuest(crypto, 3));
  }
  
  // Direction quests (1-2)
  for (const crypto of cryptos.slice(5, 7)) {
    quests.push(this.createDirectionQuest(crypto));
  }
  
  // 3. Insert into database
  for (const quest of quests) {
    await this.insertQuest(quest);
  }
  
  // 4. Notify admins
  await this.notifyAdmins(`Generated ${quests.length} new quests`);
}
```

## Resolution Logic

```javascript
// Runs every 5 minutes
async resolveExpiredQuests() {
  const expiredQuests = await db.query(`
    SELECT * FROM quests 
    WHERE status = 'active' 
    AND resolution_date < NOW()
  `);
  
  for (const quest of expiredQuests.rows) {
    try {
      const result = await this.resolveQuest(quest);
      console.log(`Resolved quest ${quest.id}: Winner = ${result.winner}`);
    } catch (error) {
      console.error(`Failed to resolve quest ${quest.id}:`, error);
    }
  }
}

async resolveQuest(quest) {
  const metadata = quest.metadata;
  
  // Fetch current price from CoinGecko
  const priceData = await this.getCryptoPrice(metadata.coinId);
  
  let winner;
  switch (metadata.type) {
    case 'crypto_price':
      winner = priceData.usd > metadata.targetPrice ? 'a' : 'b';
      break;
      
    case 'crypto_change':
      const changePercent = ((priceData.usd - metadata.startPrice) / metadata.startPrice) * 100;
      winner = changePercent > metadata.targetPercent ? 'a' : 'b';
      break;
      
    case 'crypto_direction':
      winner = priceData.usd_24h_change > 0 ? 'a' : 'b';
      break;
  }
  
  // Process resolution and payouts
  await questService.resolveQuest(quest.id, winner, 'auto_engine');
  
  return { winner, priceData };
}
```

## CoinGecko API Integration

```javascript
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

async getCryptoPrice(coinId) {
  const response = await axios.get(`${COINGECKO_API}/simple/price`, {
    params: {
      ids: coinId,
      vs_currencies: 'usd',
      include_24hr_change: true
    },
    timeout: 10000
  });
  
  return {
    usd: response.data[coinId].usd,
    usd_24h_change: response.data[coinId].usd_24h_change
  };
}

async getTopCryptos(limit = 10) {
  const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: limit,
      sparkline: false
    }
  });
  
  return response.data;
}
```

---

# 8. SATZ TOKENOMICS

## Token Properties

| Property | Value |
|----------|-------|
| Name | SATZ |
| Type | Off-chain utility token |
| Base Value | 1 SATZ ≈ $0.0001 |
| Min Redemption | 100,000 SATZ (~$10) |
| Backing | BTC in vault |

## SATZ Creation (Minting)

| Source | Amount | Condition |
|--------|--------|-----------|
| Welcome Bonus | 500 SATZ | New user |
| Daily Login (Day 1) | 25 SATZ | Login |
| Daily Login (Day 7) | 750 SATZ | 7-day streak |
| Weekly Bonus | 500 SATZ | Every 7 days |
| Milestone (Day 30) | 5,000 SATZ | 30-day streak |
| Milestone (Day 100) | 15,000 SATZ | 100-day streak |
| Referral (Referrer) | 50 SATZ | Per referral |
| Referral (Referee) | 100 SATZ | On signup |
| Task Completion | 75-200 SATZ | Per task |
| Prediction Win | Variable | From pool |
| Mystery Box | 10-5000 SATZ | 10% daily chance |
| Free Daily Spin | 10-100 SATZ | Daily |
| Watch Ad | 25 SATZ | Per ad (max 5/day) |
| Comeback Bonus | 200 SATZ | Weekly if broke |

## SATZ Destruction (Burning)

| Mechanism | Amount |
|-----------|--------|
| BTC Redemption | 100% burned |
| Shop Purchases | Item price burned |
| Booster Activation | Booster cost burned |
| Mini-game House Edge | 10-20% burned |
| Premium Features | Feature cost burned |

## Tier System

| Tier | Points Required | Multiplier |
|------|-----------------|------------|
| Novice | 0 | 1.0x |
| Apprentice | 500 | 1.2x |
| Skilled | 2,000 | 1.5x |
| Expert | 5,000 | 1.8x |
| Master | 15,000 | 2.2x |
| Legend | 50,000 | 3.0x |

## Daily Streak Rewards

| Day | Base Reward | With Legend Tier (3x) |
|-----|-------------|----------------------|
| 1 | 25 SATZ | 75 SATZ |
| 2 | 50 SATZ | 150 SATZ |
| 3 | 100 SATZ | 300 SATZ |
| 4 | 150 SATZ | 450 SATZ |
| 5 | 250 SATZ | 750 SATZ |
| 6 | 400 SATZ | 1,200 SATZ |
| 7 | 750 SATZ + 500 Weekly | 2,250 + 1,500 |
| 8+ | 750 + (day-7) × 50 | 3x |

---

# 9. BTC VAULT SYSTEM

## Vault Mechanics

```
Revenue Sources → BTC Vault
───────────────────────────
Prediction Fees (10% of pools)
├── 50% → BTC Vault
└── 50% → Operations

Advertiser Revenue (20% platform fee)
├── 50% → BTC Vault
└── 50% → Operations

Rewarded Ads Revenue
├── 50% → BTC Vault
└── 50% → Operations

Premium Subscriptions
├── 50% → BTC Vault
└── 50% → Operations

Redemption Fees (2%)
└── 100% → BTC Vault
```

## Exchange Rate Formula

```
SATZ/BTC Rate = (BTC Vault Balance × 0.8) ÷ Circulating SATZ Supply

Where:
- 0.8 = 80% redemption factor (20% buffer)
- As vault grows relative to supply, SATZ becomes more valuable
- Burns reduce supply, improving rate
```

## Vault Service Methods

```javascript
async getVaultStatus() {
  const vault = await db.query('SELECT * FROM btc_vault LIMIT 1');
  const v = vault.rows[0];
  
  return {
    balance_satoshis: v.balance_satoshis,
    balance_btc: v.balance_btc,
    usd_value: v.balance_btc * 100000, // Approximate
    total_inflow: v.total_inflow,
    total_outflow: v.total_outflow,
    total_burned_satz: v.total_burned_satz,
    circulating_satz: v.circulating_satz,
    satz_to_satoshi_rate: v.satz_to_satoshi_rate,
    progress_to_1btc: (v.balance_btc / 1) * 100,
    progress_to_5btc: (v.balance_btc / 5) * 100
  };
}

async calculateRedemption(satzAmount) {
  const vault = await this.getVaultStatus();
  const minRedemption = 100000;
  
  if (satzAmount < minRedemption) {
    throw new Error(`Minimum redemption is ${minRedemption.toLocaleString()} SATZ`);
  }
  
  const satoshisGross = Math.floor(satzAmount * vault.satz_to_satoshi_rate);
  const feePercent = 2;
  const feeSatoshis = Math.floor(satoshisGross * (feePercent / 100));
  const satoshisNet = satoshisGross - feeSatoshis;
  const btcAmount = satoshisNet / 100000000;
  
  return {
    satzAmount,
    satoshisGross,
    feeSatoshis,
    feePercent,
    satoshisNet,
    btcAmount,
    usdValue: btcAmount * 100000
  };
}
```

## Redemption Flow

```
1. User has 100,000+ SATZ
2. User initiates redemption
3. User enters BTC address
4. System calculates: SATZ × rate = BTC amount
5. 2% fee deducted → returned to vault
6. SATZ burned from circulation
7. BTC sent via NOWPayments payout API
8. User notified of completion
```

---

# 10. ADMIN DASHBOARD

## Admin Panel Structure

```
🔐 ADMIN PANEL
├── 📊 Dashboard
│   ├── Total users, active 24h/7d
│   ├── Total SATZ in circulation
│   ├── Active quests count
│   ├── Vault BTC balance
│   └── Today's revenue
├── 👥 Users
│   ├── Search by username/ID
│   ├── View user details
│   ├── Add/deduct SATZ
│   ├── Ban/unban users
│   └── View transactions
├── 🎯 Quests
│   ├── Create manual quests
│   ├── Force generate auto quests
│   ├── Resolve pending quests
│   └── View quest statistics
├── 📢 Campaigns
│   ├── View all campaigns
│   ├── Approve/reject
│   └── View completion stats
├── 💰 Vault
│   ├── Current BTC balance
│   ├── Record BTC deposits
│   ├── Process redemptions
│   └── View vault history
├── ⚙️ Config
│   ├── Welcome bonus amount
│   ├── Referral bonuses
│   ├── Daily login base
│   ├── Mystery box settings
│   └── Fee percentages
├── 📨 Broadcast
│   ├── Send to all users
│   ├── Send to active users
│   └── Message preview
└── 🤖 Auto Engine
    ├── Engine status
    ├── Force generate/resolve
    └── View logs
```

## Admin Commands

```
/admin        - Open admin panel
/genquests    - Force generate quests
/resolvequests - Force resolve expired
/queststats   - View generation stats
```

---

# 11. API ENDPOINTS REFERENCE

## Authentication

```
# Mini App (Telegram initData)
POST /api/miniapp/auth
Body: { initData: string }
Response: { token, user }

# Advertiser (OTP)
POST /api/advertiser/auth/register
POST /api/advertiser/auth/request-otp
POST /api/advertiser/auth/verify-otp
POST /api/advertiser/auth/resend-otp
```

## User Endpoints

```
GET  /api/miniapp/user/profile
GET  /api/miniapp/user/balance
GET  /api/miniapp/user/stats
GET  /api/miniapp/user/badges
GET  /api/miniapp/user/transactions
PUT  /api/miniapp/user/settings
```

## Quest Endpoints

```
GET  /api/miniapp/quests?category=&status=&sort=
GET  /api/miniapp/quests/:id
POST /api/miniapp/quests/:id/bet
GET  /api/miniapp/predictions?status=
```

## Earn Endpoints

```
GET  /api/miniapp/earn/daily
POST /api/miniapp/earn/daily/claim
POST /api/miniapp/earn/spin
GET  /api/miniapp/earn/tasks
POST /api/miniapp/earn/tasks/:id/start
POST /api/miniapp/earn/tasks/:id/verify
POST /api/miniapp/earn/watch-ad
```

## Social Endpoints

```
GET  /api/miniapp/friends
GET  /api/miniapp/friends/requests
POST /api/miniapp/friends/add
POST /api/miniapp/friends/:id/accept
POST /api/miniapp/friends/:id/decline
DELETE /api/miniapp/friends/:id

GET  /api/miniapp/challenges?status=
POST /api/miniapp/challenges
POST /api/miniapp/challenges/:id/accept
POST /api/miniapp/challenges/:id/decline
POST /api/miniapp/challenges/:id/resolve

GET  /api/miniapp/groups
POST /api/miniapp/groups
GET  /api/miniapp/groups/:id
POST /api/miniapp/groups/join
POST /api/miniapp/groups/:id/leave
GET  /api/miniapp/groups/:id/quests
POST /api/miniapp/groups/:id/quests
POST /api/miniapp/groups/:id/quests/:qid/resolve
```

## Vault Endpoints

```
GET  /api/miniapp/vault
GET  /api/redemption/info
POST /api/redemption/process
```

## Advertiser Endpoints

```
GET  /api/advertiser/dashboard
GET  /api/advertiser/balance
GET  /api/advertiser/campaigns
POST /api/advertiser/campaigns
GET  /api/advertiser/campaigns/:id
PUT  /api/advertiser/campaigns/:id
POST /api/advertiser/campaigns/:id/pause
POST /api/advertiser/campaigns/:id/resume
GET  /api/advertiser/campaigns/:id/stats
POST /api/advertiser/deposits/crypto
GET  /api/advertiser/deposits/:id/status
GET  /api/advertiser/transactions
```

---

# 12. MINI APP SPECIFICATION

## Navigation Structure

```
Bottom Nav (5 tabs):
├── 🏠 Home     - Dashboard, daily reward, hot quest
├── 🎯 Predict  - Quest list, betting, my predictions
├── 💰 Earn     - Daily streak, spin wheel, tasks
├── 👛 Wallet   - Balance, transactions, redeem
└── ⋯  More     - Friends, groups, leaderboard, shop, settings
```

## More Menu Structure

```
More Menu:
├── 👥 Friends
│   ├── Referral Link/QR
│   ├── Friend Requests
│   ├── My Friends
│   ├── Challenges
│   │   ├── Create Challenge
│   │   └── My Challenges
│   └── Add Friend
├── 👥 Groups
│   ├── My Groups
│   ├── Create Group
│   ├── Join Group
│   └── Group Detail
│       ├── Info & Stats
│       ├── Members
│       ├── Group Quests
│       ├── Leaderboard
│       └── Admin Panel (if admin)
│           ├── Create Quest
│           ├── Resolve Quest
│           └── Manage Members
├── 🏆 Leaderboard
├── 🏦 BTC Vault
├── 🚀 Boosters
├── 🛍️ Shop
├── 📊 My Stats
└── ⚙️ Settings
```

## Tech Stack (Mini App)

```json
{
  "framework": "React 18 + Vite",
  "styling": "Tailwind CSS 3.4",
  "animations": "Framer Motion 11",
  "state": "Zustand 4.5",
  "telegram": "@twa-dev/sdk 7.x",
  "charts": "Recharts",
  "confetti": "canvas-confetti"
}
```

---

# 13. ENGAGEMENT & RETENTION SYSTEMS

## Daily Must-Dos (Habit Formation)

| Feature | Reward | Purpose |
|---------|--------|---------|
| Daily Spin Wheel | 10-100 SATZ | Variable reward |
| Free Daily Prediction | 50 SATZ value | Keep broke users engaged |
| Daily Streak Claim | 25-750+ SATZ | Consistency |
| Daily Task | Variable | New content daily |

## Weekly Events (Anticipation)

| Feature | Details |
|---------|---------|
| Weekly Challenge Reset | New competitions |
| Weekly Leaderboard Prizes | Top 10 get bonuses |
| Weekend Bonus Quests | 2x rewards Sat-Sun |
| Weekly Group Competitions | Group vs group |

## Social Hooks (Obligation)

| Feature | Purpose |
|---------|---------|
| Friend Challenges Waiting | Must respond |
| Group Quest Participation | Social pressure |
| Referral Activity Notifications | Passive income reminder |
| "Beat Your Friend's Streak" | Competition |

## FOMO Triggers

| Feature | Implementation |
|---------|---------------|
| Limited-Time Flash Quests | 1-hour special quests |
| Streak at Risk Warnings | Push notification at 20h |
| "Friends Won X While Away" | Re-engagement |
| Expiring Tasks | Countdown timers |
| "X users betting now" | Social proof on quests |

## Zero Balance Recovery

| Method | Amount | Frequency |
|--------|--------|-----------|
| Comeback Bonus | 200 SATZ | Weekly (if 0 for 24h) |
| Free Daily Prediction | 50 SATZ value | Daily |
| Watch Ads | 25 SATZ each | 5/day max |
| Daily Spin | 10-100 SATZ | Daily |
| Friend Gifts | Variable | Anytime |
| Balance Protection | Keep 50 SATZ | Prevent hitting zero |

## Dopamine Engineering

| Trigger | Animation | Sound |
|---------|-----------|-------|
| Daily claim | Confetti + coin shower | Cha-ching |
| Win prediction | Gold sparkles + trophy | Victory fanfare |
| Streak milestone | Badge unlock + banner | Power-up |
| Mystery box | Box shake → reveal | Drum roll → reveal |
| Challenge win | VS screen → winner | Crowd cheer |
| Tier up | Level up banner | Epic horn |
| Spin wheel | Wheel spin → stop | Tick-tick-ding |

---

# 14. REVENUE MODEL

## Revenue Streams

### 1. Rewarded Video Ads (Highest Priority)
```
User watches 30s ad → Earns 25-50 SATZ
Platform earns: ~$0.02/view ($15-20 CPM)
Allocation: 50% vault, 50% operations

Projection at 10K DAU:
- 30,000 views/day × $0.02 = $600/day
- Vault: $300/day = $9,000/month
```

### 2. Advertiser Task Campaigns
```
Advertiser pays $100 for campaign
├── $80 (80%) → User rewards (SATZ)
└── $20 (20%) → Platform fee
    ├── $10 (50%) → BTC Vault
    └── $10 (50%) → Operations
```

### 3. Premium Subscription ("MintIQ Pro")
```
$4.99/month
├── No video ads required
├── 2x daily rewards
├── Pro badge on profile
├── Priority redemption (24h vs 72h)
├── Exclusive Pro quests
└── 50% → Vault

At 2% conversion: 10K users = 200 subs = $1,000/month
```

### 4. Sponsored Quests
```
$100-500 per branded quest
├── Logo on quest card
├── Push notification to users
├── Homepage feature
└── 50% → Vault
```

### 5. Mini-Games (SATZ Sink)
```
Lucky Slots: 10 SATZ/spin, win up to 500
├── House edge: 15%
├── Free spin option (watch ad)
└── Burns SATZ + generates ad revenue
```

## Vault Growth Allocation

| Revenue Source | Vault % | Monthly @ 10K DAU |
|----------------|---------|-------------------|
| Prediction fees | 50% | $250 |
| Advertiser campaigns | 10% | $1,000 |
| Rewarded ads | 50% | $9,000 |
| Premium subs | 50% | $500 |
| Sponsored quests | 50% | $500 |
| **TOTAL** | | **~$11,250/month** |

At $100K BTC: ~0.11 BTC/month vault growth

---

# 15. VIRAL MECHANICS & MESSAGING

## Referral System

```
Referrer gets: 50 SATZ + 7% lifetime commission
Referee gets: 100 SATZ welcome bonus

Lifetime commission applies to:
- Prediction winnings
- Task completions
- Daily rewards
```

## Invite Messages

### Referral Invite
```
🎯 I just won 2,500 SATZ predicting Bitcoin!

MintIQ lets you bet on crypto, sports & more - and 
cash out REAL BITCOIN! 🚀

Join with my link and we BOTH get bonus SATZ:
→ t.me/MintIQBot?start=ref_ABC123

I've already earned $12 worth of BTC. Your turn! 💰
```

### Challenge Invite
```
⚔️ I CHALLENGE YOU!

Think you know crypto better than me?

"Will BTC hit $110K by Jan 1?"
I say YES. Prove me wrong!

Stakes: 1,000 SATZ (~$0.10 in BTC)
Winner takes ALL! 🏆

Accept my challenge:
→ t.me/MintIQBot?start=challenge_XYZ

Don't be scared... unless you're wrong 😏
```

### Group Invite
```
🔥 Join our prediction group!

"Crypto Degens" - 47 members crushing it!

✅ Exclusive group-only predictions
✅ Weekly competition with prizes
✅ 68% average win rate

Join the squad:
→ t.me/MintIQBot?start=group_ABC

Let's stack SATZ together! 💪
```

## Notification Templates

### Win Notification
```
🎉 YOU WON!

Your prediction "ETH above $4,000" was CORRECT!

💰 Bet: 500 SATZ
📈 Multiplier: 2.1x
🏆 Won: 1,050 SATZ (+550 profit!)

[🎯 Predict Again]  [📤 Share Win]
```

### Streak at Risk
```
⚠️ YOUR STREAK IS AT RISK!

You're on a 🔥 6-day streak worth 750 SATZ tomorrow!

If you don't log in today, you'll lose:
❌ Your 6-day streak
❌ Tomorrow's 750 SATZ reward
❌ Your weekly bonus (500 SATZ)

That's 1,250 SATZ on the line! 😱

[🎁 Claim Daily Reward NOW]
```

### Friend FOMO
```
🔔 Your friend @SatoshiFan just won 5,000 SATZ!

They predicted "BTC > $105K" correctly 🎯

Their win rate: 72%
Your win rate: 58%

Time to step up your game! 😤

[⚔️ Challenge Them]  [🎯 Browse Quests]
```

---

# 16. DEPLOYMENT & INFRASTRUCTURE

## Current Setup

| Service | Platform | Details |
|---------|----------|---------|
| Bot + API | AWS EC2 | t3.small, Ubuntu 22.04 |
| Database | AWS RDS | PostgreSQL 14 |
| Website | Vercel | Next.js 14 |
| Mini App | Vercel | React + Vite |
| Domain | Cloudflare | DNS, SSL |

## Deployment Commands

```bash
# Bot (EC2)
cd ~/mintiq-bot
git pull origin main
npm install
pm2 restart mintiq-bot

# Website (Vercel)
git push origin main
# Auto-deploys via Vercel integration
```

## PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mintiq-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

---

# 17. IMPLEMENTATION ROADMAP

## Phase 1: Foundation (Days 1-3)
- [ ] Mini App project setup (Vite + React + Tailwind)
- [ ] Telegram SDK integration (@twa-dev/sdk)
- [ ] Auth flow with initData validation
- [ ] Navigation (5 tabs + More menu)
- [ ] Home screen with balance
- [ ] API client setup

## Phase 2: Core Predictions (Days 4-6)
- [ ] Quests list with filters
- [ ] Quest detail + betting modal
- [ ] Bet confirmation flow
- [ ] My predictions tabs
- [ ] Real-time pool updates

## Phase 3: Earn System (Days 7-9)
- [ ] Daily reward + streak calendar
- [ ] Spin wheel with animation
- [ ] Tasks list + completion flow
- [ ] Mystery box reveal animation
- [ ] Watch ad integration

## Phase 4: Friends & Challenges (Days 10-12)
- [ ] Friends list + requests
- [ ] Add friend flow
- [ ] Challenge creation wizard
- [ ] Challenge accept/decline
- [ ] My challenges view

## Phase 5: Groups (Days 13-15)
- [ ] Groups list + detail
- [ ] Create/join group
- [ ] Group quests
- [ ] Admin panel (create/resolve)
- [ ] Group leaderboard

## Phase 6: Wallet & Extras (Days 16-18)
- [ ] Wallet screen
- [ ] Transaction history
- [ ] Vault status + redemption
- [ ] Leaderboards
- [ ] Shop + boosters

## Phase 7: Polish (Days 19-21)
- [ ] All animations & sounds
- [ ] Haptic feedback
- [ ] Performance optimization
- [ ] Testing & bug fixes
- [ ] Deploy to production

---

# QUICK REFERENCE

## Key Contacts

| Role | Contact |
|------|---------|
| Bot Username | @MintIQBot |
| Support Email | support@mintiq.world |
| API URL | https://api.mintiq.world |
| Website | https://mintiq.world |
| Mini App | https://app.mintiq.world |

## Important Constants

```javascript
// Rewards
const WELCOME_BONUS = 500;
const REFERRAL_BONUS_REFERRER = 50;
const REFERRAL_BONUS_REFEREE = 100;
const DAILY_LOGIN_BASE = 25;
const WEEKLY_BONUS = 500;

// Fees
const TREASURY_FEE_RATE = 0.10;
const VAULT_SHARE_RATE = 0.50;
const REDEMPTION_FEE = 0.02;
const REFERRAL_COMMISSION = 0.07;

// Limits
const MIN_BET = 10;                  // Lowered from 100 to help retention
const MIN_CHALLENGE_STAKE = 500;
const MIN_REDEMPTION = 100000;
const MAX_ADS_PER_DAY = 5;
const COMEBACK_BONUS = 200;          // Weekly if balance = 0 for 24h
const FREE_DAILY_PREDICTION = 50;    // SATZ value if broke

// Tiers
const TIERS = ['novice', 'apprentice', 'skilled', 'expert', 'master', 'legend'];
const TIER_MULTIPLIERS = [1.0, 1.2, 1.5, 1.8, 2.2, 3.0];
```

---

**END OF MASTER CONTEXT DOCUMENT**

*Use this document as the primary reference for all MintIQ development. It contains comprehensive information about the product, architecture, features, and implementation details.*
