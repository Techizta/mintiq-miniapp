# MintIQ Telegram Mini App - Design Document

## Overview

Transform MintIQ from a bot-based interaction to a full Telegram Mini App experience. The Mini App provides instant authentication, rich UI, and dopamine-driven engagement mechanics.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TELEGRAM ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐         ┌─────────────────────────────┐      │
│   │   @MintIQBot│         │      MINI APP (React)       │      │
│   │             │ ──────► │   app.mintiq.world          │      │
│   │ • /start    │         │                             │      │
│   │ • Notifs    │         │  ┌─────┬─────┬─────┬─────┐ │      │
│   │ • Commands  │         │  │Home │Quest│Earn │More │ │      │
│   └─────────────┘         │  └─────┴─────┴─────┴─────┘ │      │
│         │                 │         ▲                   │      │
│         │                 │         │ initData          │      │
│         ▼                 │         │ (auto auth)       │      │
│   ┌─────────────┐         └─────────┼───────────────────┘      │
│   │  Telegram   │◄──────────────────┘                          │
│   │   Client    │                                              │
│   └─────────────┘                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐    ┌─────────────────┐                   │
│   │  API Server     │    │   PostgreSQL    │                   │
│   │  (Express)      │───►│   (Existing)    │                   │
│   │  api.mintiq.world│    │                 │                   │
│   └─────────────────┘    └─────────────────┘                   │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────────┐                                          │
│   │  Bot Server     │  (Existing - for notifications)          │
│   │  (Telegraf)     │                                          │
│   └─────────────────┘                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Journey & Screens

### 1. ENTRY POINTS

**A. From Bot**
```
User sends /start → Bot replies with "🚀 Open MintIQ" button → Opens Mini App
```

**B. Direct Link**
```
t.me/MintIQBot/app → Opens Mini App directly
```

**C. From Notification**
```
Bot notification → "Claim Now" button → Opens Mini App to specific screen
```

---

### 2. SCREEN FLOW

```
┌──────────────────────────────────────────────────────────────┐
│                       SPLASH (0.5s)                          │
│                   🪙 MintIQ Logo + Loading                   │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     HOME (Main Dashboard)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  👤 Username          ⚡ 12,450 SATZ    [🔔]           │ │
│  │  🔥 Day 7 Streak     Tier: Expert 🏅                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🎁 DAILY REWARD READY!              [CLAIM NOW]       │ │
│  │  Day 7 • +750 SATZ + Weekly Bonus!   ← Pulsing glow    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 🎯 PREDICT   │  │ 💰 EARN      │  │ 👥 FRIENDS   │      │
│  │ 5 Active     │  │ 3 Tasks      │  │ 2 Requests   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🔥 HOT QUEST                                          │ │
│  │  Will BTC hit $110K by Dec 31?                        │ │
│  │  [YES 2.1x]  [NO 1.8x]           ⏰ 6h left           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📊 LEADERBOARD                    [See All →]        │ │
│  │  🥇 CryptoKing  45,230 • 🥈 SatoshiFan 38,100        │ │
│  │  Your Rank: #127                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ════════════════════════════════════════════════════════  │
│  [🏠 Home] [🎯 Predict] [💰 Earn] [👛 Wallet] [⋯ More]    │
└──────────────────────────────────────────────────────────────┘
```

---

### 3. PREDICT SCREEN

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back                PREDICT                    [Filter 🔽]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [🔥 Hot] [⚡ New] [💎 High Stakes] [🎮 My Bets]       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🟢 LIVE                                    ⏰ 2h 34m  │ │
│  │  ──────────────────────────────────────────────────── │ │
│  │  📈 ETH above $4,000 by midnight?                     │ │
│  │                                                        │ │
│  │  Current: $3,847  │  Pool: 45,230 SATZ               │ │
│  │                                                        │ │
│  │  ┌─────────────────┐  ┌─────────────────┐            │ │
│  │  │   ✅ YES        │  │   ❌ NO         │            │ │
│  │  │   2.1x (42%)    │  │   1.8x (58%)    │            │ │
│  │  │   ███████░░░    │  │   █████████░    │            │ │
│  │  └─────────────────┘  └─────────────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🟡 PENDING                                 ⏰ 18h     │ │
│  │  ──────────────────────────────────────────────────── │ │
│  │  🗳️ Will Trump mention Bitcoin in speech?            │ │
│  │  ...                                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**BET MODAL (Bottom Sheet)**
```
┌──────────────────────────────────────────────────────────────┐
│                    ━━━━━━━━━━━━━━━                           │
│                                                              │
│  📈 ETH above $4,000 by midnight?                           │
│                                                              │
│  Your Pick:  ✅ YES  (2.1x multiplier)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Bet Amount                                            │ │
│  │  [100] [250] [500] [1000] [MAX]                        │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │                    500                           │ │ │
│  │  │  ────────────────●──────────────────            │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  💰 Balance: 12,450 SATZ                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📊 Potential Win                                      │ │
│  │  ══════════════════════════════════════════════════   │ │
│  │  Bet: 500 SATZ  ×  2.1x  =  1,050 SATZ               │ │
│  │  Profit: +550 SATZ                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          🎯 CONFIRM BET - 500 SATZ                    │ │
│  │              (Gold pulsing button)                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 4. EARN SCREEN

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back                  EARN                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🔥 STREAK: DAY 7                    🎁 CLAIM NOW!     │ │
│  │  ═══════════════════════════════════════════════════  │ │
│  │  [1]─[2]─[3]─[4]─[5]─[6]─[🎁]                         │ │
│  │   ✓   ✓   ✓   ✓   ✓   ✓   ★                          │ │
│  │                                                        │ │
│  │  Day 7 Reward: 750 SATZ + 500 WEEKLY BONUS!           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ── TASKS ────────────────────────────────────────────────  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📱 Join @CryptoAlpha                    +400 SATZ    │ │
│  │  Telegram Channel                        [START →]    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🐦 Follow @DeFiNews                     +500 SATZ    │ │
│  │  Twitter                                 [START →]    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🌐 Visit sponsor.com (30s)              +250 SATZ    │ │
│  │  Website Visit                           [START →]    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ✅ Completed Today: 2/5                              │ │
│  │  ███████████░░░░░░░░░  40%                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 5. WALLET SCREEN

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back                WALLET                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │              ⚡ 12,450 SATZ                            │ │
│  │              ≈ 0.00012450 BTC                          │ │
│  │              ≈ $12.87 USD                              │ │
│  │                                                        │ │
│  │     [📤 REDEEM BTC]      [📊 HISTORY]                 │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📈 STATS                                              │ │
│  │  ═══════════════════════════════════════════════════  │ │
│  │  Total Earned:     45,230 SATZ                        │ │
│  │  Total Won:        28,400 SATZ                        │ │
│  │  Total Spent:      32,780 SATZ                        │ │
│  │  Predictions:      47 (68% win rate)                  │ │
│  │  Redeemed:         0.00032 BTC                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ── RECENT ACTIVITY ──────────────────────────────────────  │
│                                                              │
│  │ +1,050  Won: ETH prediction         2 min ago        │ │
│  │ -500    Bet: ETH prediction         1 hour ago       │ │
│  │ +750    Daily login Day 7           3 hours ago      │ │
│  │ +500    Weekly streak bonus         3 hours ago      │ │
│  │ +400    Task: Join channel          Yesterday        │ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 6. FRIENDS/SOCIAL SCREEN

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back               FRIENDS                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  👥 INVITE & EARN                                      │ │
│  │  ═══════════════════════════════════════════════════  │ │
│  │  Get 100 SATZ per friend + 7% lifetime commission!    │ │
│  │                                                        │ │
│  │  Your referrals: 12 (earned 4,200 SATZ)               │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ t.me/MintIQBot?start=ref_ABC123                  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │       [📋 Copy]    [📤 Share]    [🎁 QR Code]        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🔔 FRIEND REQUESTS (2)                               │ │
│  │  ─────────────────────────────────────────────────── │ │
│  │  @CryptoTrader wants to be friends  [✓] [✗]          │ │
│  │  @BitcoinMaxi wants to be friends   [✓] [✗]          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ⚔️ CHALLENGES                        [Create New]    │ │
│  │  ─────────────────────────────────────────────────── │ │
│  │  vs @SatoshiFan - ETH quest         🟡 Pending       │ │
│  │  vs @CryptoKing - BTC quest         🟢 Won +200!     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  👥 MY FRIENDS (8)                    [See All →]     │ │
│  │  ─────────────────────────────────────────────────── │ │
│  │  @SatoshiFan 🔥12  @CryptoKing ⚡8  @BitcoinBob 🔥5  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 7. MORE MENU (Additional Features)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back                  MORE                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🏆 LEADERBOARD                                    →  │ │
│  │  See top predictors and your rank                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🏦 BTC VAULT                                      →  │ │
│  │  0.0847 BTC backing all SATZ                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🚀 BOOSTERS                                       →  │ │
│  │  Multiply your earnings up to 5x                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🛍️ SHOP                                           →  │ │
│  │  Profile frames, badges & customization               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  👥 GROUPS                                         →  │ │
│  │  Join prediction groups & compete                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📊 MY STATS                                       →  │ │
│  │  Detailed performance analytics                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ⚙️ SETTINGS                                       →  │ │
│  │  Notifications, preferences                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Dopamine & Engagement Mechanics

### 1. VISUAL REWARDS

| Trigger | Animation |
|---------|-----------|
| Daily claim | 🎉 Confetti explosion + coin shower |
| Win prediction | ✨ Gold sparkles + balance counter animates up |
| Streak milestone | 🏆 Trophy animation + badge unlock |
| Mystery box | 📦 Box shake → open → reveal |
| Level up | ⬆️ Level up banner + new perks unlocked |
| Referral bonus | 👥 Friend avatar flies in + SATZ awarded |

### 2. SOUNDS (Haptic on mobile)

| Event | Sound/Haptic |
|-------|--------------|
| Button tap | Light click |
| Bet placed | Coin drop sound |
| Win | Celebration jingle + strong haptic |
| Daily claim | Cash register cha-ching |
| Streak | Power-up sound |

### 3. PROGRESS MECHANICS

**Tier System Display:**
```
┌────────────────────────────────────────┐
│  Your Tier: EXPERT 🏅                  │
│  ══════════════════════════════════   │
│  Progress to MASTER:                   │
│  ████████████████░░░░  78%            │
│  2,200 / 3,000 tier points             │
│                                        │
│  MASTER perks:                         │
│  • 2x earnings multiplier              │
│  • Priority support                    │
│  • Exclusive quests                    │
└────────────────────────────────────────┘
```

**Streak Calendar:**
```
Week 1: [✓][✓][✓][✓][✓][✓][🎁]  Week complete! +500 bonus
Week 2: [✓][✓][✓][○][○][○][🎁]  Day 3 - Keep going!
```

### 4. URGENCY TRIGGERS

- **Countdown timers** on quests (pulsing when < 1 hour)
- **"Almost there!"** messages when close to milestone
- **"X users betting now"** social proof
- **"Limited time"** tasks with expiry
- **"Streak at risk!"** notification if haven't logged in

### 5. VARIABLE REWARDS (Slot machine effect)

**Mystery Box Tiers:**
```
Common (70%):    50-100 SATZ   ⬜
Rare (20%):      100-500 SATZ  🟦
Epic (8%):       500-1000 SATZ 🟪
Legendary (2%):  1000-5000 SATZ 🟨
```

---

## Technical Stack

### Frontend (Mini App)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State:** Zustand
- **Telegram SDK:** @twa-dev/sdk

### Backend
- **Existing:** Express.js API (api.mintiq.world)
- **Database:** PostgreSQL (existing)
- **Auth:** Telegram initData validation

### Key Dependencies
```json
{
  "@twa-dev/sdk": "^7.0.0",
  "react": "^18.2.0",
  "framer-motion": "^11.0.0",
  "tailwindcss": "^3.4.0",
  "zustand": "^4.5.0",
  "canvas-confetti": "^1.9.0"
}
```

---

## API Endpoints (New/Updated)

### Auth
```
POST /api/miniapp/auth
Body: { initData: string }
Returns: { token, user }
```

### User
```
GET /api/miniapp/user/profile
GET /api/miniapp/user/balance
GET /api/miniapp/user/stats
GET /api/miniapp/user/transactions?limit=20
```

### Quests/Predictions
```
GET /api/miniapp/quests/active
GET /api/miniapp/quests/:id
POST /api/miniapp/quests/:id/bet
GET /api/miniapp/predictions/my
```

### Earn
```
GET /api/miniapp/earn/daily-status
POST /api/miniapp/earn/claim-daily
GET /api/miniapp/earn/tasks
POST /api/miniapp/earn/tasks/:id/start
POST /api/miniapp/earn/tasks/:id/verify
```

### Social
```
GET /api/miniapp/friends
GET /api/miniapp/friends/requests
POST /api/miniapp/friends/invite
POST /api/miniapp/friends/:id/accept
POST /api/miniapp/friends/:id/challenge
```

### Leaderboard
```
GET /api/miniapp/leaderboard?type=earnings&period=weekly
```

### Vault
```
GET /api/miniapp/vault/status
POST /api/miniapp/vault/redeem
```

---

## Cleanup Required

Before implementing, remove/disable:
1. ~~`app.mintiq.world` user portal~~ → Repurpose for Mini App
2. Update BotFather Mini App URL
3. Update bot /start command to open Mini App

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Mini App project setup
- [ ] Telegram SDK integration
- [ ] Auth flow with initData
- [ ] Basic navigation
- [ ] Home screen with balance

### Phase 2: Core Features (Week 2)
- [ ] Predict screen + betting
- [ ] Earn screen + daily rewards
- [ ] Wallet screen

### Phase 3: Social & Gamification (Week 3)
- [ ] Friends screen
- [ ] Leaderboard
- [ ] Animations & sounds
- [ ] Streak visuals

### Phase 4: Polish (Week 4)
- [ ] Shop & boosters
- [ ] Groups
- [ ] Performance optimization
- [ ] Testing & bug fixes

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Daily Active Users | +50% |
| Session Duration | >5 min avg |
| Daily Login Rate | >60% |
| Predictions per User | +30% |
| Referral Conversion | +40% |

---

## Summary

The Mini App transforms MintIQ from "bot you interact with" to "app you open daily." 

Key principles:
1. **Instant gratification** - Rewards feel immediate and satisfying
2. **Clear progress** - Users always know what's next
3. **Social proof** - Show what others are doing
4. **Variable rewards** - Keep users curious
5. **Low friction** - One tap to any action

Let's build it! 🚀
