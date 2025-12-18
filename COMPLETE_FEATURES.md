# MintIQ Telegram Mini App - Complete Feature Specification

## Overview

Transform MintIQ from a bot-based interaction to a full Telegram Mini App with ALL existing features plus enhanced UI/UX.

---

## Complete Feature List (From Project Docs + Schema)

### 1. CORE PREDICTION SYSTEM
- [x] Browse active quests by category (crypto, sports, politics, other)
- [x] View quest details (pool sizes, odds, deadline, participants)
- [x] Place bets on Option A or Option B
- [x] Custom bet amounts with slider
- [x] View my predictions (pending, won, lost)
- [x] Auto-generated crypto quests (price targets, % changes)
- [x] Quest categories and filters
- [x] Real-time pool updates and odds

### 2. FRIEND SYSTEM ⭐ (Highest Impact)
- [x] Add friends via username/referral link
- [x] View friends list with online status
- [x] Friend requests (accept/decline)
- [x] Friends-only leaderboard
- [x] Activity feed (friends' bets, wins)

### 3. FRIEND CHALLENGES ⭐⭐ (3-5x Retention)
- [x] Create head-to-head challenge
- [x] Set custom title/description
- [x] Set stake amount (min 500 SATZ)
- [x] Send to specific friend
- [x] Friend accepts & takes opposite position
- [x] Winner takes pot (minus 10% treasury)
- [x] Challenge notifications
- [x] My challenges list (pending, active, completed)

### 4. PREDICTION GROUPS (Private Pools)
- [x] Create group (name, description)
- [x] Generate unique invite code
- [x] Invite friends to group
- [x] Group-only quests (visible to members)
- [x] **Group admin creates quests**
- [x] **Group admin resolves/settles quests**
- [x] **Admin earns 20% of treasury fees (2% of volume)**
- [x] Group leaderboard
- [x] Group stats & achievements
- [x] Member management (admin can kick)
- [x] Leave group

### 5. EARN SYSTEM
- [x] Daily login rewards with streaks (Day 1-7+)
- [x] Streak milestone bonuses (Day 7, 14, 30, 60, 100)
- [x] Weekly streak bonus (+500 every 7 days)
- [x] Mystery boxes (10% chance on daily login)
- [x] Tier multipliers (Novice 1x → Legend 3x)
- [x] Task completion from advertisers
- [x] First task bonus (500 SATZ)
- [x] Referral bonuses (50 referrer + 100 referee)
- [x] 7% lifetime referral commission

### 6. TASKS (Advertiser-Funded)
- [x] Join Telegram channel
- [x] Visit website (30s timer)
- [x] Follow Twitter account
- [x] Launch Mini App
- [x] Task verification (auto + manual)
- [x] Task rewards in SATZ
- [x] Task completion tracking
- [x] Daily task limits

### 7. WALLET & BTC VAULT
- [x] View SATZ balance
- [x] View BTC equivalent
- [x] View USD equivalent
- [x] Transaction history
- [x] BTC Vault status (total BTC, milestone)
- [x] SATZ → BTC redemption (min 100,000 SATZ)
- [x] Dynamic exchange rate
- [x] Redemption fee (2%)
- [x] Burn mechanism on redemption

### 8. LEADERBOARDS
- [x] Global leaderboard (earnings)
- [x] Win rate leaderboard
- [x] Streak leaderboard
- [x] Friends leaderboard
- [x] Group leaderboard
- [x] Weekly/Monthly/All-time filters

### 9. TIERS & PROGRESSION
- [x] Tier system (Novice → Apprentice → Skilled → Expert → Master → Legend)
- [x] Tier points from activity
- [x] Tier perks (multipliers, priority)
- [x] Progress bar to next tier

### 10. BOOSTERS
- [x] 2x earnings booster
- [x] 5x earnings booster
- [x] Booster duration & activation
- [x] Booster purchase with SATZ

### 11. SHOP (Customization)
- [x] Profile frames
- [x] Bio colors
- [x] Animated badges
- [x] Banner styles
- [x] Purchase with SATZ (burns tokens)

### 12. ACHIEVEMENTS & BADGES
- [x] Streak badges (Week Warrior, Fortnight Fighter, etc.)
- [x] Win streak badges
- [x] Prediction count badges
- [x] Referral badges
- [x] Badge display on profile

### 13. REFERRAL SYSTEM
- [x] Unique referral code/link
- [x] Share link functionality
- [x] QR code generation
- [x] Referral count tracking
- [x] Lifetime commission earnings
- [x] Referral tree view

### 14. WIN BROADCASTS & SHARING
- [x] Opt-in win broadcasts to friends
- [x] Shareable win cards (image generation)
- [x] One-tap share to Telegram

### 15. SETTINGS
- [x] Notification preferences
- [x] Win broadcast toggle
- [x] Language selection
- [x] Privacy settings

### 16. NOTIFICATIONS (Bot → User)
- [x] Quest resolution results
- [x] Win notifications
- [x] Friend request notifications
- [x] Challenge notifications
- [x] Daily reminder (streak at risk)
- [x] Milestone celebrations

---

## Screen Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MINI APP NAVIGATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   BOTTOM NAV BAR (5 tabs)                                       │
│   ┌─────┬─────┬─────┬─────┬─────┐                              │
│   │ 🏠  │ 🎯  │ 💰  │ 👛  │ ⋯   │                              │
│   │Home │Quest│Earn │Wallet│More │                              │
│   └─────┴─────┴─────┴─────┴─────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

SCREEN HIERARCHY:

🏠 HOME
├── User header (avatar, name, balance, tier)
├── Daily reward card (claim button if available)
├── Quick actions grid
│   ├── 🎯 Predict (badge: X active)
│   ├── 💰 Earn (badge: X tasks)
│   └── 👥 Friends (badge: X requests)
├── Hot quest preview
├── Leaderboard preview (top 3)
└── Activity feed (friends' wins)

🎯 PREDICT
├── Category tabs (Hot, Crypto, Sports, Politics, All)
├── Quest cards list
│   └── Quest card → Quest detail modal
│       ├── Full description
│       ├── Pool stats & odds
│       ├── Bet slider & buttons
│       └── Confirm bet modal
├── My Predictions tab
│   ├── Active bets
│   ├── Won
│   └── Lost
└── Create Challenge button → Challenge flow

💰 EARN
├── Daily streak section
│   ├── Streak calendar (7 days visual)
│   ├── Claim button
│   └── Next reward preview
├── Tasks section
│   ├── Available tasks list
│   └── Task card → Task detail
│       ├── Instructions
│       ├── Start button
│       └── Verify button
├── Completed today count
└── Mystery box chance indicator

👛 WALLET
├── Balance card
│   ├── SATZ amount (large)
│   ├── BTC equivalent
│   └── USD equivalent
├── Action buttons
│   ├── Redeem BTC
│   └── Transaction History
├── Stats grid
│   ├── Total earned
│   ├── Total won
│   ├── Win rate
│   └── Predictions made
└── Recent transactions list

⋯ MORE
├── 👥 Friends → Friends screen
│   ├── Referral section (link, share, QR)
│   ├── Friend requests
│   ├── My friends list
│   ├── Challenges
│   │   ├── Create challenge
│   │   └── My challenges
│   └── Add friend
├── 👥 Groups → Groups screen
│   ├── My groups list
│   ├── Create group
│   ├── Join group (invite code)
│   └── Group detail
│       ├── Group info
│       ├── Members list
│       ├── Group quests
│       ├── Group leaderboard
│       └── Admin panel (if admin)
│           ├── Create quest
│           ├── Resolve quest
│           └── Manage members
├── 🏆 Leaderboard → Leaderboard screen
│   ├── Type tabs (Earnings, Wins, Streaks)
│   ├── Period tabs (Weekly, Monthly, All-time)
│   └── Rankings list
├── 🏦 BTC Vault → Vault screen
│   ├── Vault balance
│   ├── Growth chart
│   ├── Milestone progress
│   └── Redeem section
├── 🚀 Boosters → Boosters screen
│   ├── Active boosters
│   └── Purchase boosters
├── 🛍️ Shop → Shop screen
│   ├── Categories (Frames, Colors, Badges, Banners)
│   ├── Items grid
│   └── Preview & purchase
├── 📊 My Stats → Stats screen
│   ├── Prediction analytics
│   ├── Earnings breakdown
│   ├── Achievements
│   └── Badges earned
└── ⚙️ Settings → Settings screen
    ├── Notifications toggle
    ├── Win broadcasts toggle
    ├── Language
    └── About
```

---

## Friend Challenge Flow (Detailed)

```
┌──────────────────────────────────────────────────────────────┐
│                  CREATE CHALLENGE                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Select Friend                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  👤 @SatoshiFan      ← Selected                        │ │
│  │  👤 @CryptoKing                                        │ │
│  │  👤 @BitcoinBob                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Step 2: Create Prediction                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Challenge Title:                                      │ │
│  │  [BTC hits $120K by Jan 1?                          ] │ │
│  │                                                        │ │
│  │  Description (optional):                               │ │
│  │  [Let's see who knows Bitcoin better!              ] │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Step 3: Set Stake & Position                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Stake Amount: [500] [1000] [2000] [Custom]           │ │
│  │                                                        │ │
│  │  Your Position:                                        │ │
│  │  [✓ YES, it will]    [ NO, it won't]                  │ │
│  │                                                        │ │
│  │  @SatoshiFan will take: NO                            │ │
│  │                                                        │ │
│  │  Winner gets: 900 SATZ (after 10% fee)                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Step 4: Set Expiry                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Challenge expires in:                                 │ │
│  │  [24h] [48h] [1 week] [Custom date]                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          ⚔️ SEND CHALLENGE - 500 SATZ                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘

FRIEND RECEIVES:
┌──────────────────────────────────────────────────────────────┐
│  ⚔️ CHALLENGE FROM @YourName                                │
│  ────────────────────────────────────────────────────────── │
│                                                              │
│  "BTC hits $120K by Jan 1?"                                 │
│                                                              │
│  @YourName says: YES                                        │
│  You would bet: NO                                          │
│                                                              │
│  Stake: 500 SATZ each                                       │
│  Winner gets: 900 SATZ                                      │
│                                                              │
│  Expires in: 23h 45m                                        │
│                                                              │
│  [✅ ACCEPT]                    [❌ DECLINE]                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Group Admin Quest Creation Flow

```
┌──────────────────────────────────────────────────────────────┐
│  👑 ADMIN PANEL - Crypto Degens Group                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Group Stats                                              │
│  ────────────────────────────────────────────────────────── │
│  Members: 47  │  Active Quests: 3  │  Your Earnings: 2,450  │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  [➕ CREATE QUEST]                                          │
│  [📋 MANAGE QUESTS]                                         │
│  [👥 MANAGE MEMBERS]                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘

CREATE GROUP QUEST:
┌──────────────────────────────────────────────────────────────┐
│  ➕ CREATE GROUP QUEST                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Quest Title:                                                │
│  [Will ETH flip BTC market cap in 2025?                  ] │
│                                                              │
│  Description:                                                │
│  [The flippening question - ETH overtakes BTC...         ] │
│                                                              │
│  Option A:                                                   │
│  [Yes, ETH flips BTC                                     ] │
│                                                              │
│  Option B:                                                   │
│  [No, BTC stays #1                                       ] │
│                                                              │
│  Betting Deadline:                                           │
│  [Dec 31, 2024 11:59 PM                              🗓️] │
│                                                              │
│  Resolution Date:                                            │
│  [Dec 31, 2025 11:59 PM                              🗓️] │
│                                                              │
│  ℹ️ As admin, you will settle this quest manually           │
│  💰 You earn 2% of total pool volume                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              ✅ CREATE QUEST                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘

RESOLVE/SETTLE QUEST:
┌──────────────────────────────────────────────────────────────┐
│  ⚖️ RESOLVE QUEST                                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  "Will ETH flip BTC market cap in 2025?"                    │
│                                                              │
│  Pool A (Yes): 12,500 SATZ (32 bets)                        │
│  Pool B (No): 18,200 SATZ (45 bets)                         │
│  Total Pool: 30,700 SATZ                                    │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Select Winner:                                              │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │    ✅ OPTION A      │  │    ✅ OPTION B      │          │
│  │    Yes wins         │  │    No wins          │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                              │
│  ⚠️ This action is irreversible. All payouts will be        │
│     distributed automatically.                               │
│                                                              │
│  💰 Your admin fee: 614 SATZ (2% of pool)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         ⚖️ CONFIRM RESOLUTION                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Dopamine Mechanics

### Visual Celebrations

| Trigger | Animation | Sound |
|---------|-----------|-------|
| Daily claim | Confetti + coin shower + balance animate | Cha-ching |
| Win prediction | Gold sparkles + trophy + balance pulse | Victory fanfare |
| Streak milestone | Badge unlock animation + banner | Power-up |
| Mystery box | Box shake → open → reveal tier | Drum roll → reveal |
| Challenge win | VS screen → winner declared | Crowd cheer |
| Tier up | Level up banner + perks revealed | Epic horn |
| Referral joins | Friend avatar flies in + bonus | Coin drop |
| Group quest created | Quest card creation animation | Whoosh |

### Progress Everywhere

- Tier progress bar (always visible in header)
- Streak calendar (visual 7-day tracker)
- Daily task progress (X/5 completed)
- Group milestone progress
- Redemption milestone progress (to 100K SATZ)

### Urgency & FOMO

- Countdown timers on quests (pulsing red when < 1 hour)
- "X users betting now" live counter
- "Streak at risk!" warning if past 20 hours
- Limited time tasks with expiry
- Friend activity feed showing wins

### Variable Rewards

- Mystery box tiers (Common → Legendary)
- Random bonus on milestone days
- Surprise multiplier events
- Lucky prediction bonus (rare)

---

## API Endpoints (Complete)

### Auth
```
POST /api/miniapp/auth          - Validate initData, return user
```

### User
```
GET  /api/miniapp/user/profile  - Full profile with stats
GET  /api/miniapp/user/balance  - Balance + BTC/USD equiv
GET  /api/miniapp/user/stats    - Detailed stats
GET  /api/miniapp/user/badges   - Earned badges
GET  /api/miniapp/user/transactions - Transaction history
PUT  /api/miniapp/user/settings - Update settings
```

### Quests
```
GET  /api/miniapp/quests        - List active quests (filters)
GET  /api/miniapp/quests/:id    - Quest detail
POST /api/miniapp/quests/:id/bet - Place bet
GET  /api/miniapp/predictions   - My predictions
```

### Earn
```
GET  /api/miniapp/earn/daily    - Daily status + streak
POST /api/miniapp/earn/daily    - Claim daily reward
GET  /api/miniapp/earn/tasks    - Available tasks
POST /api/miniapp/earn/tasks/:id/start  - Start task
POST /api/miniapp/earn/tasks/:id/verify - Verify completion
```

### Friends
```
GET  /api/miniapp/friends       - Friends list
GET  /api/miniapp/friends/requests - Pending requests
POST /api/miniapp/friends/add   - Send friend request
POST /api/miniapp/friends/:id/accept - Accept request
POST /api/miniapp/friends/:id/decline - Decline request
DELETE /api/miniapp/friends/:id - Remove friend
```

### Challenges
```
GET  /api/miniapp/challenges    - My challenges
POST /api/miniapp/challenges    - Create challenge
POST /api/miniapp/challenges/:id/accept - Accept challenge
POST /api/miniapp/challenges/:id/decline - Decline
POST /api/miniapp/challenges/:id/resolve - Resolve (admin)
```

### Groups
```
GET  /api/miniapp/groups        - My groups
POST /api/miniapp/groups        - Create group
GET  /api/miniapp/groups/:id    - Group detail
POST /api/miniapp/groups/join   - Join via invite code
POST /api/miniapp/groups/:id/leave - Leave group
GET  /api/miniapp/groups/:id/members - Members list
GET  /api/miniapp/groups/:id/quests - Group quests
GET  /api/miniapp/groups/:id/leaderboard - Group rankings

# Admin only
POST /api/miniapp/groups/:id/quests - Create group quest
POST /api/miniapp/groups/:id/quests/:qid/resolve - Resolve quest
DELETE /api/miniapp/groups/:id/members/:uid - Kick member
```

### Leaderboard
```
GET  /api/miniapp/leaderboard   - Global rankings
GET  /api/miniapp/leaderboard/friends - Friends only
```

### Vault & Redemption
```
GET  /api/miniapp/vault         - Vault status
GET  /api/miniapp/vault/rate    - Current exchange rate
POST /api/miniapp/vault/redeem  - Initiate redemption
```

### Shop & Boosters
```
GET  /api/miniapp/shop          - Shop items
POST /api/miniapp/shop/purchase - Buy item
GET  /api/miniapp/boosters      - Active boosters
POST /api/miniapp/boosters/activate - Activate booster
```

### Referrals
```
GET  /api/miniapp/referrals     - Referral stats
GET  /api/miniapp/referrals/link - Get referral link/QR
```

---

## Technical Stack

```json
{
  "frontend": {
    "framework": "React 18 + Vite",
    "styling": "Tailwind CSS 3.4",
    "animations": "Framer Motion 11",
    "state": "Zustand 4.5",
    "telegram": "@twa-dev/sdk 7.x",
    "charts": "Recharts",
    "confetti": "canvas-confetti"
  },
  "backend": {
    "runtime": "Node.js (existing Express API)",
    "database": "PostgreSQL (existing)",
    "cache": "Redis (optional)",
    "auth": "Telegram initData validation"
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (3-4 days)
- [ ] Project setup (Vite + React + Tailwind)
- [ ] Telegram SDK integration
- [ ] Auth flow with initData
- [ ] Navigation (5 tabs)
- [ ] Home screen (balance, quick actions)
- [ ] Basic API integration

### Phase 2: Core Predictions (3-4 days)
- [ ] Quests list + filters
- [ ] Quest detail modal
- [ ] Betting flow (slider, confirm)
- [ ] My predictions view
- [ ] Real-time odds display

### Phase 3: Earn System (2-3 days)
- [ ] Daily reward + streak calendar
- [ ] Tasks list
- [ ] Task completion flow
- [ ] Mystery box animation
- [ ] Tier display

### Phase 4: Friends & Challenges (3-4 days)
- [ ] Friends list + requests
- [ ] Add friend flow
- [ ] Challenge creation flow
- [ ] Challenge accept/decline
- [ ] My challenges view

### Phase 5: Groups (3-4 days)
- [ ] Groups list
- [ ] Create/join group
- [ ] Group detail
- [ ] Group quests
- [ ] Admin panel (create/resolve quests)
- [ ] Group leaderboard

### Phase 6: Wallet & Vault (2-3 days)
- [ ] Wallet screen
- [ ] Transaction history
- [ ] Vault status
- [ ] Redemption flow

### Phase 7: Extras (2-3 days)
- [ ] Leaderboards (global, friends, groups)
- [ ] Shop & boosters
- [ ] Settings
- [ ] Badges/achievements

### Phase 8: Polish (2-3 days)
- [ ] All animations & celebrations
- [ ] Sound effects
- [ ] Performance optimization
- [ ] Testing & bug fixes

---

## Cleanup Before Start

1. ~~Remove `app.mintiq.world` user portal~~ → Repurpose URL for Mini App
2. Update BotFather → Set Mini App URL
3. Update bot /start → Button to open Mini App
4. Keep existing API endpoints (add /miniapp/* routes)

---

Ready to build! 🚀
