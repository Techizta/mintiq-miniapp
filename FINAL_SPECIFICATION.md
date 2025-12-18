# MintIQ Telegram Mini App - FINAL SPECIFICATION

## Table of Contents
1. [Complete Feature List](#complete-feature-list)
2. [Auto Quest Engine](#auto-quest-engine)
3. [Admin Dashboard](#admin-dashboard)
4. [User Screens](#user-screens)
5. [Viral & Network Effects](#viral--network-effects)
6. [Dopamine Engineering](#dopamine-engineering)
7. [API Endpoints](#api-endpoints)
8. [Implementation Plan](#implementation-plan)

---

## Complete Feature List

### 🎯 PREDICTION ENGINE
| Feature | Description | Status |
|---------|-------------|--------|
| Browse quests | Filter by category (Crypto, Sports, Politics, Other) | ✅ |
| Quest details | Pool sizes, odds, deadline, participant count | ✅ |
| Place bets | Slider for custom amounts, instant confirmation | ✅ |
| My predictions | Active, won, lost tabs | ✅ |
| Real-time odds | Live pool updates | ✅ |
| **Auto-generated quests** | CoinGecko API integration | ✅ |
| **Auto-resolution** | Price verification + payout | ✅ |
| Quest categories | Hot, New, High Stakes, Ending Soon | ✅ |

### 👥 SOCIAL LAYER
| Feature | Description | Status |
|---------|-------------|--------|
| Add friends | Via username, referral link, QR code | ✅ |
| Friends list | Online status, quick challenge | ✅ |
| Friend requests | Accept/decline with notifications | ✅ |
| Activity feed | Friends' bets, wins, achievements | ✅ |
| Friends leaderboard | Weekly competition | ✅ |
| Win broadcasts | Opt-in notifications to friends | ✅ |
| Shareable win cards | Auto-generated images | ✅ |

### ⚔️ FRIEND CHALLENGES (3-5x Retention)
| Feature | Description | Status |
|---------|-------------|--------|
| Create challenge | Custom title, stake, expiry | ✅ |
| Select friend | From friends list | ✅ |
| Set stake | Min 500 SATZ, winner takes 90% | ✅ |
| Accept/decline | Push notifications | ✅ |
| Challenge feed | Pending, active, completed | ✅ |
| **Challenge resolver** | Admin or auto-resolution | ✅ |

### 👑 PREDICTION GROUPS (Admin Earnings)
| Feature | Description | Status |
|---------|-------------|--------|
| Create group | Name, description, privacy | ✅ |
| Invite system | Unique invite codes | ✅ |
| **Admin creates quests** | Custom group-only predictions | ✅ |
| **Admin resolves quests** | Manual settlement | ✅ |
| **Admin earns 2%** | Of all group volume | ✅ |
| Group leaderboard | Internal rankings | ✅ |
| Member management | Kick, promote, invite | ✅ |
| Group stats | Total volume, members, quests | ✅ |

### 💰 EARN SYSTEM
| Feature | Description | Status |
|---------|-------------|--------|
| Daily login | 25-750+ SATZ based on streak | ✅ |
| Streak calendar | Visual 7-day tracker | ✅ |
| Weekly bonus | +500 SATZ every 7 days | ✅ |
| Milestone rewards | Day 7/14/30/60/100 badges | ✅ |
| Mystery boxes | 10% chance, tiered rewards | ✅ |
| Tier multipliers | 1x-3x based on tier | ✅ |
| Win streak bonus | 3/5/7 consecutive wins | ✅ |
| First task bonus | 500 SATZ | ✅ |

### 📋 TASKS (Advertiser-Funded)
| Feature | Description | Status |
|---------|-------------|--------|
| Telegram join | Auto-verified via API | ✅ |
| Website visit | 30s timer verification | ✅ |
| Twitter follow | OAuth verification | ✅ |
| Mini App launch | Auto-tracked | ✅ |
| Task rewards | 100-800 SATZ per task | ✅ |
| Daily limits | Per campaign caps | ✅ |
| Retention tracking | 24h/7d membership check | ✅ |

### 👛 WALLET & VAULT
| Feature | Description | Status |
|---------|-------------|--------|
| Balance display | SATZ, BTC, USD equivalent | ✅ |
| Transaction history | All activity log | ✅ |
| **BTC Vault status** | Real BTC backing | ✅ |
| **Vault milestones** | Progress to 5 BTC goal | ✅ |
| SATZ → BTC redemption | Min 100,000 SATZ | ✅ |
| Dynamic exchange rate | Based on vault/supply | ✅ |
| Redemption fee | 2% → back to vault | ✅ |
| Burn mechanism | Redeemed SATZ destroyed | ✅ |

### 🏆 PROGRESSION
| Feature | Description | Status |
|---------|-------------|--------|
| Tier system | Novice → Legend (6 tiers) | ✅ |
| Tier progress bar | Always visible | ✅ |
| Tier perks | Multipliers, priority, badges | ✅ |
| Achievements | 20+ badges to earn | ✅ |
| Badge display | Profile showcase | ✅ |

### 🚀 BOOSTERS & SHOP
| Feature | Description | Status |
|---------|-------------|--------|
| 2x/5x boosters | Multiply all earnings | ✅ |
| Booster duration | 24h/7d options | ✅ |
| Profile frames | 8 unique frames | ✅ |
| Bio colors | Custom color options | ✅ |
| Animated badges | Premium effects | ✅ |
| Banner styles | Profile backgrounds | ✅ |
| **SATZ burning** | Shop purchases burn tokens | ✅ |

### 🔗 REFERRAL SYSTEM
| Feature | Description | Status |
|---------|-------------|--------|
| Unique referral link | t.me/MintIQBot?start=ref_XXX | ✅ |
| QR code generation | Shareable image | ✅ |
| Referral bonus | 50 (referrer) + 100 (referee) | ✅ |
| **7% lifetime commission** | On all referral activity | ✅ |
| Referral stats | Count, earnings, tree | ✅ |
| Leaderboard | Top referrers | ✅ |

---

## Auto Quest Engine

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTO QUEST ENGINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   GENERATION (Every 6 hours)                                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  1. Fetch top 10 cryptos from CoinGecko API             │  │
│   │  2. Generate diverse quest types:                        │  │
│   │     • Price targets ($BTC above $X?)                    │  │
│   │     • % change (Will ETH gain 5% today?)                │  │
│   │     • Daily direction (SOL green or red?)               │  │
│   │  3. Set betting deadline (6-24h)                        │  │
│   │  4. Set resolution time (1-2h after deadline)           │  │
│   │  5. Store metadata for auto-resolution                  │  │
│   │  6. Notify admins of new quests                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   RESOLUTION (Every 5 minutes)                                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  1. Find quests past resolution_date                     │  │
│   │  2. Fetch current price from CoinGecko                  │  │
│   │  3. Compare with quest metadata (target price/%)        │  │
│   │  4. Determine winning option (A or B)                   │  │
│   │  5. Calculate payouts (pool × odds)                     │  │
│   │  6. Distribute winnings to winners                      │  │
│   │  7. Take 10% treasury fee                               │  │
│   │  8. Send 50% of fee to BTC Vault                        │  │
│   │  9. Notify winners via bot                              │  │
│   │  10. Notify admins of resolution                        │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Quest Types Generated

| Type | Example | Resolution |
|------|---------|------------|
| `crypto_price` | "Will BTC be above $105,000 at midnight?" | Check price at deadline |
| `crypto_change` | "Will ETH gain more than 3% in 24h?" | Compare start vs end price |
| `crypto_direction` | "Will SOL close GREEN today?" | Check 24h change positive/negative |
| `platform_engagement` | "Will MintIQ hit 100 predictions today?" | Check internal metrics |

### CoinGecko Integration

```javascript
// Supported coins
const SUPPORTED_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  // ... 10 total
];

// API endpoint (free tier: 30 calls/min)
const API = 'https://api.coingecko.com/api/v3';

// Fetch price: GET /simple/price?ids=bitcoin&vs_currencies=usd
// Fetch 24h change: GET /coins/bitcoin?localization=false
```

---

## Admin Dashboard

### Admin Panel Structure

```
┌──────────────────────────────────────────────────────────────┐
│  🔐 ADMIN PANEL                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📊 DASHBOARD                                           ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  Users: 15,234 (+127 today)  │  Active (24h): 3,421    ││
│  │  Total SATZ: 45.2M           │  Predictions: 892 today  ││
│  │  Active Quests: 12           │  Vault: 0.847 BTC       ││
│  │  Revenue (today): $234.50    │  Pending Redemptions: 3 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 👥 Users │ │ 🎯 Quests │ │ 📢 Tasks │ │ 💰 Vault │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ ⚙️ Config│ │ 📨 Blast │ │ 🤖 Engine│ │ 📊 Stats │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Admin Features Detail

#### 👥 User Management
```
┌──────────────────────────────────────────────────────────────┐
│  👥 USER MANAGEMENT                                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Search: [Username/Telegram ID              ] [Search]   │
│                                                              │
│  ── RECENT USERS ────────────────────────────────────────── │
│  │ @SatoshiFan  │ 12,450 SATZ │ Expert │ Joined Dec 15    │ │
│  │ @CryptoKing  │ 8,200 SATZ  │ Skilled │ Joined Dec 14   │ │
│  │ @BitcoinBob  │ 3,100 SATZ  │ Novice │ Joined Dec 13    │ │
│                                                              │
│  ── USER ACTIONS ────────────────────────────────────────── │
│  [💰 Add SATZ]  [➖ Deduct SATZ]  [🚫 Ban/Unban]           │
│  [📜 View Transactions]  [📊 View Stats]                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 🎯 Quest Management
```
┌──────────────────────────────────────────────────────────────┐
│  🎯 QUEST MANAGEMENT                                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [➕ Create Quest]  [🤖 Generate Auto Quests]  [⚖️ Resolve] │
│                                                              │
│  ── ACTIVE QUESTS (12) ─────────────────────────────────── │
│  │ #127 │ BTC > $105K? │ Pool: 45,230 │ ⏰ 6h │ [Resolve]  │
│  │ #126 │ ETH +5%?     │ Pool: 12,100 │ ⏰ 2h │ [Resolve]  │
│  │ #125 │ SOL direction │ Pool: 8,400  │ ⏰ 18h│ [Details] │
│                                                              │
│  ── PENDING RESOLUTION (3) ─────────────────────────────── │
│  │ #124 │ DOGE > $0.15 │ Auto-resolving in 5 min...       │
│                                                              │
│  ── MANUAL RESOLUTION ──────────────────────────────────── │
│  Quest #127: "Will BTC hit $105K?"                          │
│  Pool A (Yes): 25,400 SATZ (56%)                            │
│  Pool B (No): 19,830 SATZ (44%)                             │
│  [✅ Option A Wins]  [✅ Option B Wins]  [❌ Cancel]        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 📢 Campaign Management
```
┌──────────────────────────────────────────────────────────────┐
│  📢 CAMPAIGN MANAGEMENT                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [➕ Create Campaign]  [📊 Analytics]                        │
│                                                              │
│  ── ACTIVE CAMPAIGNS ───────────────────────────────────── │
│  │ CryptoAlpha Channel │ $500 budget │ 847/1000 joins      │
│  │ $0.05/join │ 72% 7d retention │ [Pause] [Edit]          │
│  ├─────────────────────────────────────────────────────────│
│  │ DeFi Website Visit  │ $200 budget │ 423/800 visits      │
│  │ $0.03/visit │ N/A retention │ [Pause] [Edit]            │
│                                                              │
│  ── CAMPAIGN STATS ─────────────────────────────────────── │
│  Total Spend: $1,247.50  │  Completions: 4,823             │
│  Avg Retention (7d): 68% │  Active Campaigns: 5            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 💰 Vault Management
```
┌──────────────────────────────────────────────────────────────┐
│  💰 VAULT MANAGEMENT                                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🏦 BTC VAULT                                           ││
│  │  ═════════════════════════════════════════════════════  ││
│  │  Balance: 0.84723456 BTC (~$87,425)                     ││
│  │  Progress: ████████████████░░░░ 85% to 1 BTC            ││
│  │                                                          ││
│  │  Total Inflow: 1.234 BTC  │  Total Outflow: 0.387 BTC  ││
│  │  Burned SATZ: 12.4M       │  Circulating: 45.2M         ││
│  │  Exchange Rate: 0.00000187 sat/SATZ                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  [➕ Record BTC Deposit]  [📜 Vault History]                │
│                                                              │
│  ── PENDING REDEMPTIONS (3) ────────────────────────────── │
│  │ @user1 │ 150,000 SATZ → 0.00028 BTC │ [✅ Process] [❌]│
│  │ @user2 │ 200,000 SATZ → 0.00037 BTC │ [✅ Process] [❌]│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 📨 Broadcast System
```
┌──────────────────────────────────────────────────────────────┐
│  📨 BROADCAST MESSAGE                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Target Audience:                                            │
│  [○ All Users (15,234)]  [● Active 24h (3,421)]             │
│  [○ Active 7d (8,102)]   [○ Custom Segment]                 │
│                                                              │
│  Message:                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔥 HOT QUEST ALERT!                                     ││
│  │                                                          ││
│  │ BTC is pumping! Predict if it hits $110K by midnight.   ││
│  │                                                          ││
│  │ Current pool: 45,000 SATZ                               ││
│  │ Place your bet now! 🎯                                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  [📋 Preview]  [📤 Send to 3,421 users]                     │
│                                                              │
│  ⚠️ Last broadcast: 2 days ago                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 🤖 Auto Quest Engine Control
```
┌──────────────────────────────────────────────────────────────┐
│  🤖 AUTO QUEST ENGINE                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Status: 🟢 RUNNING                                          │
│                                                              │
│  Generation: Every 6 hours  │  Last: 2h ago                 │
│  Resolution: Every 5 mins   │  Last: 3 min ago              │
│                                                              │
│  ── TODAY'S STATS ──────────────────────────────────────── │
│  Generated: 8 quests                                         │
│  Resolved: 12 quests                                         │
│  Resolution Success: 100%                                    │
│  API Calls: 127/500 (daily limit)                           │
│                                                              │
│  [🔄 Force Generate Now]  [⚖️ Force Resolve Now]            │
│  [⏸️ Pause Engine]        [📊 View Logs]                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### ⚙️ System Configuration
```
┌──────────────────────────────────────────────────────────────┐
│  ⚙️ SYSTEM CONFIGURATION                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── REWARDS ────────────────────────────────────────────── │
│  Welcome Bonus:        [500    ] SATZ                       │
│  Referral (Referrer):  [50     ] SATZ                       │
│  Referral (Referee):   [100    ] SATZ                       │
│  Daily Login Base:     [25     ] SATZ                       │
│  First Task Bonus:     [500    ] SATZ                       │
│                                                              │
│  ── MYSTERY BOX ────────────────────────────────────────── │
│  Chance:       [10    ]%                                    │
│  Min Reward:   [10    ] SATZ                                │
│  Max Reward:   [500   ] SATZ                                │
│                                                              │
│  ── ECONOMICS ──────────────────────────────────────────── │
│  Treasury Fee:         [10    ]%                            │
│  Vault Share:          [50    ]%                            │
│  Referral Commission:  [7     ]%                            │
│  Redemption Fee:       [2     ]%                            │
│  Min Redemption:       [100000] SATZ                        │
│                                                              │
│  [💾 Save Changes]  [🔄 Reset Defaults]                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## User Screens

### Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         MINI APP                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   BOTTOM NAV (5 tabs)                                           │
│   ┌─────────┬─────────┬─────────┬─────────┬─────────┐          │
│   │   🏠    │   🎯    │   💰    │   👛    │   ⋯     │          │
│   │  Home   │ Predict │  Earn   │ Wallet  │  More   │          │
│   └─────────┴─────────┴─────────┴─────────┴─────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

MORE MENU EXPANDS TO:
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

---

## Viral & Network Effects

### 1. Invitation Messaging (High-Converting Copy)

#### Referral Invite
```
🎯 I just won 2,500 SATZ predicting Bitcoin!

MintIQ lets you bet on crypto, sports & more - and 
cash out REAL BITCOIN! 🚀

Join with my link and we BOTH get bonus SATZ:
→ t.me/MintIQBot?start=ref_ABC123

I've already earned $12 worth of BTC. Your turn! 💰
```

#### Challenge Invite
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

#### Group Invite
```
🔥 Join our prediction group!

"Crypto Degens" - 47 members crushing it!

✅ Exclusive group-only predictions
✅ Weekly competition with prizes
✅ 68% average win rate
✅ No randoms, just us

Join the squad:
→ t.me/MintIQBot?start=group_ABC

Let's stack SATZ together! 💪
```

### 2. Win Notifications (FOMO Triggers)

#### Personal Win
```
🎉 YOU WON!

Your prediction "ETH above $4,000" was CORRECT!

💰 You bet: 500 SATZ
📈 Multiplier: 2.1x
🏆 You won: 1,050 SATZ (+550 profit!)

Your new balance: 12,450 SATZ (~$1.24 BTC)

[🎯 Predict Again]  [📤 Share Win]
```

#### Friend Activity (FOMO)
```
🔔 Your friend @SatoshiFan just won 5,000 SATZ!

They predicted "BTC > $105K" correctly 🎯

Their win rate: 72%
Your win rate: 58%

Time to step up your game! 😤

[⚔️ Challenge Them]  [🎯 Browse Quests]
```

#### Streak at Risk
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

### 3. Social Proof Elements

#### On Quest Cards
```
┌────────────────────────────────────────────────────┐
│  🔥 TRENDING NOW                      🔴 LIVE     │
│  ────────────────────────────────────────────────  │
│  Will BTC hit $110K by midnight?                   │
│                                                    │
│  👥 127 predictors  │  💰 45,230 SATZ pool        │
│  ⚡ 23 bets in last hour                          │
│                                                    │
│  @CryptoKing and 3 friends bet on this            │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### On Leaderboard
```
🏆 TOP EARNERS THIS WEEK

🥇 @CryptoKing    +12,450 SATZ  (78% win rate)
🥈 @SatoshiFan   +8,230 SATZ   (72% win rate)
🥉 @BitcoinBob   +6,100 SATZ   (65% win rate)

───────────────────────────────────────────
📍 Your Rank: #127 (+2,340 SATZ)

🎯 Win 3 more predictions to reach Top 100!
```

### 4. Urgency Triggers

| Element | Copy | Location |
|---------|------|----------|
| Quest deadline | "⏰ Only 2h 34m left to bet!" | Quest card |
| Streak warning | "🔥 Claim now or lose your 6-day streak!" | Home card |
| Limited task | "⚡ Only 23 spots left!" | Task card |
| Flash quest | "🚨 FLASH QUEST - 1 hour only!" | Push notification |
| Pool milestone | "Pool hits 50K SATZ = 2x rewards!" | Quest detail |

### 5. Network Effect Mechanics

| Mechanic | Description | Viral Coefficient |
|----------|-------------|------------------|
| **Referral commission** | 7% lifetime on all referral activity | High - passive income |
| **Friend challenges** | 1v1 bets create engagement loops | Very High - competitive |
| **Group admin earnings** | 2% of group volume | High - incentivizes growth |
| **Win broadcasts** | Friends see your wins | Medium - FOMO |
| **Shareable win cards** | Brag on Twitter/TG | Medium - social proof |
| **Group invites** | Exclusive group content | High - exclusivity |

---

## Dopamine Engineering

### Reward Schedule

| Trigger | Reward Type | Timing | Animation |
|---------|-------------|--------|-----------|
| App open | Anticipation | Instant | Balance pulse |
| Daily claim | Fixed + Variable | Instant | Confetti explosion |
| Prediction placed | Anticipation | Instant | Coin fly animation |
| Win notification | Variable reward | Delayed | Gold sparkles + sound |
| Streak milestone | Fixed + Badge | Instant | Trophy unlock |
| Mystery box | Variable (slot machine) | Delayed reveal | Box shake + open |
| Challenge win | Social reward | Delayed | VS victory screen |
| Tier up | Achievement | Milestone | Level up banner |
| Referral joins | Social + Fixed | Delayed | Friend avatar fly-in |

### Visual Celebrations

```javascript
const CELEBRATIONS = {
  dailyClaim: {
    confetti: true,
    coinShower: true,
    sound: 'cha-ching',
    haptic: 'success',
    duration: 2000
  },
  
  winPrediction: {
    confetti: { colors: ['#FFD700', '#FFA500'] },
    sparkles: true,
    balanceAnimate: true,
    sound: 'victory-fanfare',
    haptic: 'heavy',
    duration: 3000
  },
  
  streakMilestone: {
    badgeUnlock: true,
    fireworks: true,
    sound: 'power-up',
    haptic: 'heavy',
    duration: 2500
  },
  
  mysteryBox: {
    boxShake: true,
    suspensePause: 1500,
    tierReveal: true,
    sound: 'drum-roll → reveal',
    haptic: 'pattern',
    duration: 4000
  },
  
  challengeWin: {
    vsScreen: true,
    winnerDeclare: true,
    opponentShrink: true,
    sound: 'crowd-cheer',
    haptic: 'success',
    duration: 3500
  },
  
  tierUp: {
    levelBanner: true,
    perksReveal: true,
    newBadge: true,
    sound: 'epic-horn',
    haptic: 'heavy',
    duration: 4000
  }
};
```

### Progress Visibility

Every screen shows progress toward something:

| Screen | Progress Element |
|--------|------------------|
| Header | Tier progress bar (always visible) |
| Home | Streak day counter + next reward preview |
| Predict | "Win 2 more for mystery box!" |
| Earn | Daily tasks progress (3/5 complete) |
| Wallet | "12,000 more SATZ to redeem BTC!" |
| Friends | "Invite 3 more for Referral King badge!" |
| Groups | "Group needs 5 more bets for bonus pool!" |

### Loss Aversion Triggers

| Scenario | Message | Purpose |
|----------|---------|---------|
| Streak at risk | "Don't lose your 6-day streak worth 750 SATZ!" | Retention |
| Challenge expiring | "24h to accept or you forfeit!" | Engagement |
| Quest ending | "Last chance! Pool closes in 30 min" | FOMO |
| Inactive 3 days | "Your friends won 15,000 SATZ while you were gone 😢" | Re-engagement |
| Near milestone | "Only 200 SATZ away from Expert tier!" | Progression |

---

## API Endpoints

### Authentication
```
POST /api/miniapp/auth
  Body: { initData: string }
  Returns: { token, user, isNew }
```

### User
```
GET  /api/miniapp/user/profile
GET  /api/miniapp/user/balance
GET  /api/miniapp/user/stats
GET  /api/miniapp/user/badges
GET  /api/miniapp/user/transactions?limit=20&offset=0
PUT  /api/miniapp/user/settings
```

### Quests
```
GET  /api/miniapp/quests?category=&status=active&sort=hot
GET  /api/miniapp/quests/:id
POST /api/miniapp/quests/:id/bet  { amount, option }
GET  /api/miniapp/predictions?status=active|won|lost
```

### Earn
```
GET  /api/miniapp/earn/daily
POST /api/miniapp/earn/daily/claim
GET  /api/miniapp/earn/tasks
GET  /api/miniapp/earn/tasks/:id
POST /api/miniapp/earn/tasks/:id/start
POST /api/miniapp/earn/tasks/:id/verify
```

### Friends
```
GET  /api/miniapp/friends
GET  /api/miniapp/friends/requests
POST /api/miniapp/friends/add  { username }
POST /api/miniapp/friends/:id/accept
POST /api/miniapp/friends/:id/decline
DELETE /api/miniapp/friends/:id
```

### Challenges
```
GET  /api/miniapp/challenges?status=pending|active|completed
POST /api/miniapp/challenges  { friendId, title, stake, position, expiresAt }
POST /api/miniapp/challenges/:id/accept
POST /api/miniapp/challenges/:id/decline
```

### Groups
```
GET  /api/miniapp/groups
POST /api/miniapp/groups  { name, description, isPrivate }
GET  /api/miniapp/groups/:id
POST /api/miniapp/groups/join  { inviteCode }
POST /api/miniapp/groups/:id/leave
GET  /api/miniapp/groups/:id/members
GET  /api/miniapp/groups/:id/quests
GET  /api/miniapp/groups/:id/leaderboard

# Admin only
POST /api/miniapp/groups/:id/quests  { title, optionA, optionB, deadline }
POST /api/miniapp/groups/:id/quests/:qid/resolve  { winner: 'a'|'b' }
DELETE /api/miniapp/groups/:id/members/:uid
```

### Leaderboard
```
GET  /api/miniapp/leaderboard?type=earnings|wins|streaks&period=weekly|monthly|all
GET  /api/miniapp/leaderboard/friends
```

### Vault
```
GET  /api/miniapp/vault
GET  /api/miniapp/vault/rate
POST /api/miniapp/vault/redeem  { amount, btcAddress }
```

### Shop & Boosters
```
GET  /api/miniapp/shop
POST /api/miniapp/shop/purchase  { itemId }
GET  /api/miniapp/boosters
POST /api/miniapp/boosters/activate  { boosterId }
```

### Referrals
```
GET  /api/miniapp/referrals
GET  /api/miniapp/referrals/link
```

### Admin (Separate auth required)
```
GET  /api/admin/dashboard
GET  /api/admin/users?search=&page=&limit=
GET  /api/admin/users/:id
PUT  /api/admin/users/:id  { action: 'addSatz'|'deductSatz'|'ban'|'unban', amount? }
GET  /api/admin/quests?status=
POST /api/admin/quests  { title, optionA, optionB, category, deadline }
POST /api/admin/quests/:id/resolve  { winner }
POST /api/admin/quests/generate
POST /api/admin/quests/resolve-all
GET  /api/admin/campaigns
POST /api/admin/campaigns
PUT  /api/admin/campaigns/:id
GET  /api/admin/vault
POST /api/admin/vault/deposit  { btcAmount, txHash }
POST /api/admin/vault/process-redemption/:id
GET  /api/admin/config
PUT  /api/admin/config
POST /api/admin/broadcast  { audience, message }
GET  /api/admin/engine/status
POST /api/admin/engine/generate
POST /api/admin/engine/resolve
```

---

## Implementation Plan

### Phase 1: Foundation (Days 1-3)
- [x] Design specification ← **YOU ARE HERE**
- [ ] Project setup (Vite + React + Tailwind + TWA SDK)
- [ ] Telegram initData auth
- [ ] Navigation (5 tabs + More menu)
- [ ] Home screen with balance
- [ ] API client setup

### Phase 2: Core Predictions (Days 4-6)
- [ ] Quests list with filters
- [ ] Quest detail + betting modal
- [ ] Bet confirmation flow
- [ ] My predictions tabs
- [ ] Real-time pool updates

### Phase 3: Earn System (Days 7-8)
- [ ] Daily reward + streak calendar
- [ ] Claim animation (confetti)
- [ ] Tasks list + completion flow
- [ ] Mystery box reveal animation

### Phase 4: Friends & Challenges (Days 9-11)
- [ ] Friends list + requests
- [ ] Add friend flow
- [ ] Challenge creation wizard
- [ ] Challenge accept/decline
- [ ] My challenges view

### Phase 5: Groups (Days 12-14)
- [ ] Groups list + detail
- [ ] Create/join group
- [ ] Group quests
- [ ] Admin panel (create/resolve)
- [ ] Group leaderboard

### Phase 6: Wallet & Extras (Days 15-17)
- [ ] Wallet screen
- [ ] Transaction history
- [ ] Vault status + redemption
- [ ] Leaderboards
- [ ] Shop + boosters

### Phase 7: Admin Dashboard (Days 18-19)
- [ ] Admin auth
- [ ] Dashboard stats
- [ ] User management
- [ ] Quest management + engine control
- [ ] Campaign management
- [ ] Broadcast system

### Phase 8: Polish (Days 20-21)
- [ ] All animations & sounds
- [ ] Haptic feedback
- [ ] Performance optimization
- [ ] Testing & bug fixes
- [ ] Deploy to production

---

## Cleanup Before Start

1. **Remove web portal:** Delete/repurpose `app.mintiq.world`
2. **Update BotFather:** Set Mini App URL
3. **Update bot /start:** Add "🚀 Open MintIQ" button
4. **Keep existing APIs:** Add `/miniapp/*` routes alongside existing

---

## Success Metrics

| Metric | Current | Target (30 days) |
|--------|---------|------------------|
| DAU | ~100 | 500+ |
| Session duration | 2 min | 5+ min |
| Daily login rate | 30% | 60%+ |
| Predictions/user/day | 1.2 | 3+ |
| Referral rate | 5% | 15%+ |
| Challenge acceptance | N/A | 60%+ |
| Group creation | N/A | 10+/week |

---

**This is the COMPLETE specification. Ready to build! 🚀**
