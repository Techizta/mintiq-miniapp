# MintIQ - Complete Project Context Document
## Master Reference for Development & Implementation

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
│   │ NOWPayments│     │  Telegram  │     │  SendGrid  │        │
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
| **Email** | SendGrid / Nodemailer | OTP, notifications |
| **Hosting** | AWS EC2 + Vercel | Bot on EC2, web on Vercel |

## Server Configuration

| Component | Host | Port | Domain |
|-----------|------|------|--------|
| Bot + API | EC2 (3.223.236.31) | 3002 | api.mintiq.world |
| Website | Vercel | 443 | mintiq.world |
| Mini App | Vercel | 443 | app.mintiq.world |
| Database | RDS | 5432 | mintiq-db.*.rds.amazonaws.com |

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

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASS=SG.xxx

# Admin
ADMIN_IDS=123456789,987654321

# Redis
REDIS_URL=redis://localhost:6379
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
    is_banned BOOLEAN DEFAULT false,
    
    -- Timestamps
    last_active_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### quests
```sql
CREATE TABLE quests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'other',
    
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
    status VARCHAR(50) DEFAULT 'active',
    winning_option CHAR(1),
    resolved_at TIMESTAMP,
    
    -- Metadata for auto-resolution
    metadata JSONB,
    
    -- Groups
    group_id INTEGER,
    creator_id INTEGER,
    created_by VARCHAR(100) DEFAULT 'system',
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### predictions
```sql
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    quest_id INTEGER NOT NULL REFERENCES quests(id),
    chosen_option CHAR(1) NOT NULL,
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
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, resolved, cancelled
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
    status VARCHAR(50) DEFAULT 'active',
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
    
    -- Budget
    budget_usd DECIMAL(12,2) NOT NULL,
    spent_usd DECIMAL(12,2) DEFAULT 0,
    price_per_completion DECIMAL(8,4) NOT NULL,
    user_reward_satz INTEGER NOT NULL,
    
    -- Limits
    target_completions INTEGER,
    total_completions INTEGER DEFAULT 0,
    daily_limit INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
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
    reward_satz INTEGER,
    rewarded_at TIMESTAMP,
    still_member_24h BOOLEAN,
    still_member_7d BOOLEAN,
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

### daily_logins
```sql
CREATE TABLE daily_logins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    login_date DATE NOT NULL,
    streak_day INTEGER DEFAULT 1,
    reward_satz INTEGER,
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
bot.action(/^bet_(\d+)_(a|b)$/, predictHandler.placeBet);
bot.action(/^confirm_bet_(\d+)_(a|b)_(\d+)$/, predictHandler.confirmBet);

// Earn
bot.action('daily_login', earnHandler.claimDailyLogin);
bot.action(/^task_(\d+)$/, earnHandler.showTaskDetails);
bot.action(/^complete_task_(\d+)$/, earnHandler.startTask);

// Social
bot.action('add_friend', socialHandler.addFriendFromNetwork);
bot.action(/^accept_friend_(\d+)$/, socialHandler.acceptFriend);
bot.action('create_challenge', socialHandler.createChallenge);
bot.action(/^challenge_friend_(\d+)$/, socialHandler.selectFriendForChallenge);
bot.action(/^accept_challenge_(\d+)$/, socialHandler.acceptChallenge);

// Groups
bot.action('my_groups', socialHandler.showMyGroups);
bot.action('create_group', socialHandler.createGroup);
bot.action(/^group_(\d+)$/, socialHandler.showGroupDetails);

// Admin
bot.action('admin_dashboard', adminHandler.showDashboard);
bot.action(/^admin_resolve_(\d+)_(a|b)$/, adminHandler.resolveQuest);
```

## Handler Files Structure

```
src/handlers/
├── start.js           # /start command, referral processing
├── menu.js            # Main menu, stats, leaderboard
├── predict.js         # Quest browsing, betting, my predictions
├── earn.js            # Daily login, tasks
├── social.js          # Friends, challenges, groups
├── wallet.js          # Balance, transactions, redemption
├── vault.js           # BTC vault display
├── settings.js        # User preferences
├── booster.js         # Earnings multipliers
├── shop.js            # Customization items
└── admin.js           # Admin panel (restricted)
```

---

# 5. SERVICES LAYER

## Service Files

```
src/services/
├── database.js          # PostgreSQL connection pool
├── redis.js             # Redis client
├── userService.js       # User CRUD, SATZ operations
├── questService.js      # Quest CRUD, resolution, payouts
├── socialService.js     # Friends, challenges, groups
├── taskService.js       # Task verification, completion
├── advertiserService.js # Advertiser CRUD, campaigns
├── vaultService.js      # BTC vault operations
├── engagementEngine.js  # Streaks, mystery boxes, tiers
├── autoQuestEngine.js   # Auto quest generation/resolution
├── notificationService.js # Push notifications
├── nowPaymentsService.js  # Crypto payments
├── otpService.js        # Email OTP
├── emailService.js      # Email sending
└── treasuryService.js   # Treasury fee processing
```

## Key Service Methods

### userService.js
```javascript
// Balance operations
addSatz(userId, amount, type, description)
deductSatz(userId, amount, type, description)
getBalance(userId)

// User management
findOrCreate(telegramUser, referrerCode)
updateLastActive(userId)
getConfig() // System config values
```

### questService.js
```javascript
// Quest operations
getActiveQuests(category, limit)
getQuestById(questId)
placeBet(userId, questId, option, amount)
resolveQuest(questId, winningOption)
calculatePayout(pool, betAmount, winningPool)
```

### socialService.js
```javascript
// Friends
sendFriendRequest(userId, friendUsername)
acceptFriendRequest(userId, requesterId)
getFriends(userId)
getPendingRequests(userId)

// Challenges
createChallenge(challengerId, challengedId, data)
acceptChallenge(challengeId, userId)
resolveChallenge(challengeId, winnerId)

// Groups
createGroup(adminId, name, description)
joinGroup(userId, inviteCode)
getGroupQuests(groupId)
createGroupQuest(groupId, adminId, questData)
```

### engagementEngine.js
```javascript
// Daily rewards
claimDailyReward(userId)
getStreakInfo(userId)

// Tiers
calculateTier(tierPoints)
getTierMultiplier(tier)

// Mystery boxes
awardMysteryBox(userId, trigger)

// Win streaks
processWinStreak(userId)
```

---

# 6. ADVERTISER SELF-SERVE PORTAL

## Overview

The advertiser portal (mintiq.world/advertiser) allows businesses to create and manage task campaigns that reward users with SATZ.

## Authentication Flow

```
1. Advertiser visits /advertiser/login
2. Enters email → System sends 6-digit OTP
3. Enters OTP → JWT token issued (7 days)
4. Dashboard loaded with advertiser data
```

## Portal Pages

| Route | Purpose |
|-------|---------|
| `/advertiser/login` | OTP-based login |
| `/advertiser/register` | New account signup |
| `/advertiser/dashboard` | Main dashboard |
| `/advertiser/campaigns/new` | Create campaign |
| `/advertiser/campaigns/[id]` | Campaign details |
| `/advertiser/deposit` | Add funds |

## Campaign Types

| Type | Verification | Suggested Price | User Reward |
|------|--------------|-----------------|-------------|
| `channel_join` | Telegram API | $0.05 | 100 SATZ |
| `website_visit` | Timer (30s) | $0.03 | 75 SATZ |
| `twitter_follow` | OAuth API | $0.10 | 200 SATZ |

## API Endpoints (Advertiser)

```
# Authentication
POST /api/advertiser/auth/register     # New signup
POST /api/advertiser/auth/request-otp  # Request login code
POST /api/advertiser/auth/verify-otp   # Verify code, get JWT
POST /api/advertiser/auth/resend-otp   # Resend code

# Dashboard
GET  /api/advertiser/dashboard         # Full dashboard data
GET  /api/advertiser/balance           # Current balance

# Campaigns
GET  /api/advertiser/campaigns         # List campaigns
POST /api/advertiser/campaigns         # Create campaign
GET  /api/advertiser/campaigns/:id     # Campaign details
PUT  /api/advertiser/campaigns/:id     # Update campaign
POST /api/advertiser/campaigns/:id/pause   # Pause
POST /api/advertiser/campaigns/:id/resume  # Resume

# Payments
POST /api/advertiser/deposit           # Create deposit invoice
GET  /api/advertiser/transactions      # Payment history
```

## Campaign Creation Flow

```javascript
// POST /api/advertiser/campaigns
{
  name: "Join Our Channel",
  taskType: "channel_join",
  description: "Join our community for updates",
  targetChannel: "@mychannel",
  budgetUsd: 100,
  pricePerCompletion: 0.05,
  dailyLimit: 50
}

// Response
{
  success: true,
  campaign: {
    id: 123,
    name: "Join Our Channel",
    userRewardSatz: 100, // Auto-set from template
    status: "active"
  }
}
```

## Task Verification

### Channel Join (Telegram API)
```javascript
async verifyChannelJoin(userId, taskId, bot) {
  const member = await bot.getChatMember(`@${channelUsername}`, telegramId);
  return ['member', 'administrator', 'creator'].includes(member.status);
}
```

### Website Visit (Timer)
```javascript
// Frontend tracks 30 seconds on target URL
// Backend verifies session duration
async verifyWebsiteVisit(userId, taskId, visitStartTime) {
  const duration = Date.now() - visitStartTime;
  return duration >= requiredSeconds * 1000;
}
```

---

# 7. AUTO QUEST ENGINE

## Overview

Automatically generates and resolves crypto prediction quests using CoinGecko API.

## Generation Schedule

- **Frequency:** Every 6 hours
- **Quests per cycle:** 3-5 diverse quests
- **Categories:** crypto_price, crypto_change, crypto_direction

## Quest Templates

```javascript
const templates = {
  crypto_price: {
    title: "Will {coin} be above ${price} at {time}?",
    optionA: "Yes, above",
    optionB: "No, below",
    metadata: { type: "crypto_price", coinId, targetPrice }
  },
  
  crypto_change: {
    title: "Will {coin} gain more than {percent}% in {hours} hours?",
    optionA: "Yes",
    optionB: "No",
    metadata: { type: "crypto_change", coinId, targetPercent }
  },
  
  crypto_direction: {
    title: "Will {coin} close GREEN today?",
    optionA: "Yes, Green",
    optionB: "No, Red",
    metadata: { type: "crypto_direction", coinId }
  }
};
```

## Supported Coins

```javascript
const SUPPORTED_COINS = [
  { id: 'bitcoin', symbol: 'BTC' },
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'ripple', symbol: 'XRP' },
  { id: 'dogecoin', symbol: 'DOGE' },
  { id: 'cardano', symbol: 'ADA' },
  { id: 'polkadot', symbol: 'DOT' },
  { id: 'avalanche-2', symbol: 'AVAX' },
  { id: 'chainlink', symbol: 'LINK' },
  { id: 'polygon', symbol: 'MATIC' }
];
```

## Resolution Logic

```javascript
async resolveQuest(quest) {
  const metadata = quest.metadata;
  
  // Fetch current price from CoinGecko
  const price = await getCryptoPrice(metadata.coinId);
  
  // Determine winner based on quest type
  let winner;
  switch (metadata.type) {
    case 'crypto_price':
      winner = price.usd > metadata.targetPrice ? 'a' : 'b';
      break;
    case 'crypto_change':
      winner = price.usd_24h_change > metadata.targetPercent ? 'a' : 'b';
      break;
    case 'crypto_direction':
      winner = price.usd_24h_change > 0 ? 'a' : 'b';
      break;
  }
  
  // Process payouts
  await questService.resolveQuest(quest.id, winner);
}
```

## Admin Commands

```
/genquests    - Force generate quests
/resolvequests - Force resolve expired quests
/queststats   - View generation stats
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
| Daily Login | 25-750+ SATZ | Based on streak |
| Weekly Bonus | 500 SATZ | Every 7 days |
| Referral (Referrer) | 50 SATZ | Per referral |
| Referral (Referee) | 100 SATZ | On signup |
| Task Completion | 75-200 SATZ | Per task |
| Prediction Win | Variable | From pool |
| Mystery Box | 10-5000 SATZ | 10% daily chance |
| Milestone | 500-15000 SATZ | Day 7/14/30/60/100 |

## SATZ Destruction (Burning)

| Mechanism | Amount |
|-----------|--------|
| BTC Redemption | 100% burned |
| Shop Purchases | Item price burned |
| Booster Activation | Booster cost burned |
| Mini-game House Edge | 10-20% burned |

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

| Day | Base Reward |
|-----|-------------|
| 1 | 25 SATZ |
| 2 | 50 SATZ |
| 3 | 100 SATZ |
| 4 | 150 SATZ |
| 5 | 250 SATZ |
| 6 | 400 SATZ |
| 7 | 750 SATZ + 500 Weekly |
| 8+ | 750 + (day-7) × 50 |

---

# 9. BTC VAULT SYSTEM

## Vault Mechanics

```
Treasury Fee (10% of prediction pools)
├── 50% → BTC Vault (converted to BTC)
└── 50% → Operations

Redemption Fee (2%)
└── 100% → BTC Vault
```

## Exchange Rate Formula

```
SATZ/BTC Rate = BTC Vault Balance ÷ Circulating SATZ Supply
```

## Redemption Flow

1. User has 100,000+ SATZ
2. User enters BTC address
3. System calculates: SATZ × rate = BTC amount
4. 2% fee deducted → returned to vault
5. SATZ burned from circulation
6. BTC sent via NOWPayments

## Vault Service Methods

```javascript
getVaultStatus()           // Current vault state
calculateRedemption(satz)  // Preview redemption
processRedemption(data)    // Execute redemption
processTreasuryFee(amount) // Add to vault from fees
```

---

# 10. ADMIN DASHBOARD

## Admin Panel Sections

### 📊 Dashboard
- Total users, active 24h/7d
- Total SATZ in circulation
- Active quests count
- Vault BTC balance
- Today's revenue

### 👥 User Management
- Search by username/ID
- View user details
- Add/deduct SATZ
- Ban/unban users
- View transactions

### 🎯 Quest Management
- Create manual quests
- Force generate auto quests
- Resolve pending quests
- View quest statistics

### 📢 Campaign Management
- View all campaigns
- Approve/reject campaigns
- View completion stats
- Manage advertisers

### 💰 Vault Management
- Current BTC balance
- Record BTC deposits
- Process redemptions
- View vault history

### ⚙️ System Config
- Welcome bonus amount
- Referral bonuses
- Daily login base
- Mystery box settings
- Fee percentages

### 📨 Broadcast
- Send to all users
- Send to active users
- Message preview

### 🤖 Auto Engine
- Engine status
- Force generate/resolve
- View logs

---

# 11. API ENDPOINTS REFERENCE

## Authentication

```
# User (Telegram initData)
POST /api/miniapp/auth
Body: { initData: string }
Response: { token, user }

# Advertiser (OTP)
POST /api/advertiser/auth/request-otp
POST /api/advertiser/auth/verify-otp
```

## User Endpoints

```
GET  /api/miniapp/user/profile
GET  /api/miniapp/user/balance
GET  /api/miniapp/user/stats
GET  /api/miniapp/user/transactions
PUT  /api/miniapp/user/settings
```

## Quest Endpoints

```
GET  /api/miniapp/quests?category=&status=
GET  /api/miniapp/quests/:id
POST /api/miniapp/quests/:id/bet
GET  /api/miniapp/predictions
```

## Earn Endpoints

```
GET  /api/miniapp/earn/daily
POST /api/miniapp/earn/daily/claim
GET  /api/miniapp/earn/tasks
POST /api/miniapp/earn/tasks/:id/start
POST /api/miniapp/earn/tasks/:id/verify
```

## Social Endpoints

```
GET  /api/miniapp/friends
POST /api/miniapp/friends/add
POST /api/miniapp/friends/:id/accept
POST /api/miniapp/challenges
POST /api/miniapp/challenges/:id/accept
GET  /api/miniapp/groups
POST /api/miniapp/groups
POST /api/miniapp/groups/:id/quests
POST /api/miniapp/groups/:id/quests/:qid/resolve
```

## Vault Endpoints

```
GET  /api/miniapp/vault
GET  /api/redemption/info
POST /api/redemption/process
```

---

# 12. MINI APP SPECIFICATION

## Navigation Structure

```
Bottom Nav (5 tabs):
├── 🏠 Home     - Dashboard, daily reward, hot quest
├── 🎯 Predict  - Quest list, betting, my predictions
├── 💰 Earn     - Daily streak, tasks, mystery box
├── 👛 Wallet   - Balance, transactions, redeem
└── ⋯  More     - Friends, groups, leaderboard, shop, settings
```

## Key Screens

### Home
- User header (avatar, balance, tier)
- Daily reward card (claimable indicator)
- Quick action buttons
- Hot quest preview
- Activity feed

### Predict
- Category tabs (Hot, Crypto, Sports)
- Quest cards with odds
- Bet modal with slider
- My predictions tabs

### Earn
- Streak calendar (7 days)
- Claim button
- Daily spin wheel
- Tasks list
- Progress indicators

### Wallet
- Balance (SATZ, BTC, USD)
- Action buttons (Redeem, History)
- Stats grid
- Recent transactions

### More Menu
- Friends (requests, list, challenges)
- Groups (my groups, create, admin panel)
- Leaderboard
- BTC Vault
- Boosters
- Shop
- Stats
- Settings

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
| Streak at Risk Warnings | Push notification |
| "Friends Won X While Away" | Re-engagement |
| Expiring Tasks | Countdown timers |

## Zero Balance Recovery

| Method | Amount | Frequency |
|--------|--------|-----------|
| Comeback Bonus | 200 SATZ | Weekly (if 0 for 24h) |
| Free Daily Prediction | 50 SATZ value | Daily |
| Watch Ads | 25 SATZ each | 5/day max |
| Daily Spin | 10-100 SATZ | Daily |
| Friend Gifts | Variable | Anytime |

---

# 14. REVENUE MODEL

## Revenue Streams

### 1. Rewarded Video Ads
```
User watches 30s ad → Earns 25-50 SATZ
You earn: ~$0.02/view
Allocation: 50% vault, 50% operations
```

### 2. Advertiser Campaigns
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
├── No video ads
├── 2x daily rewards
├── Pro badge
├── Priority redemption
└── 50% → Vault
```

### 4. Sponsored Quests
```
$100-500 per branded quest
├── Logo on quest card
├── Push notification
├── Homepage feature
└── 50% → Vault
```

## Vault Growth Allocation

| Revenue Source | Vault % |
|----------------|---------|
| Prediction fees | 50% |
| Advertiser campaigns | 10% |
| Rewarded ads | 50% |
| Premium subs | 50% |
| Redemption fees | 100% |

---

# 15. VIRAL MECHANICS & MESSAGING

## Referral System

```
Referrer gets: 50 SATZ + 7% lifetime commission
Referee gets: 100 SATZ welcome bonus
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

## Process Management

```bash
# PM2 for bot
pm2 start src/index.js --name mintiq-bot
pm2 logs mintiq-bot
pm2 restart mintiq-bot
```

## Environment Files

```
# EC2: /home/ubuntu/mintiq-bot/.env
# Vercel: Environment Variables in dashboard
```

## Deployment Commands

```bash
# Bot (EC2)
cd ~/mintiq-bot
git pull origin main
npm install
pm2 restart mintiq-bot

# Website (Vercel)
git push origin main
# Auto-deploys via Vercel GitHub integration
```

---

# QUICK REFERENCE

## Key Files

```
Bot Repository:
├── src/index.js           # Main entry, bot setup
├── src/handlers/          # Command handlers
├── src/services/          # Business logic
├── src/routes/            # API routes
└── package.json

Website Repository (mintiq-web):
├── src/app/               # Next.js pages
├── src/components/        # React components
└── package.json

Mini App (to be created):
├── src/                   # React components
├── public/                # Static assets
└── package.json
```

## Database Connection

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

## Bot Token

```javascript
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
```

---

**END OF MASTER CONTEXT DOCUMENT**

*This document provides complete context for MintIQ development. Use it as a reference when implementing new features or debugging existing functionality.*
