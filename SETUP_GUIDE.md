# MintIQ Mini App - Complete Setup Guide

## 📁 Project Structure

```
mintiq-miniapp/
├── app/                          # React Mini App (Frontend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Layout components
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── BottomNav.jsx
│   │   │   │   └── Header.jsx
│   │   │   ├── shared/           # Shared components
│   │   │   │   ├── SplashScreen.jsx
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   └── Celebration.jsx
│   │   │   └── features/         # Feature components
│   │   │       ├── BetModal.jsx
│   │   │       └── ResultModal.jsx
│   │   ├── pages/                # All screens
│   │   │   ├── HomePage.jsx
│   │   │   ├── PredictPage.jsx
│   │   │   ├── QuestDetailPage.jsx
│   │   │   ├── EarnPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── WalletPage.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   ├── RedeemPage.jsx
│   │   │   ├── MorePage.jsx
│   │   │   ├── FriendsPage.jsx
│   │   │   ├── ChallengesPage.jsx
│   │   │   ├── GroupsPage.jsx
│   │   │   ├── GroupDetailPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   ├── VaultPage.jsx
│   │   │   ├── ShopPage.jsx
│   │   │   ├── BoostersPage.jsx
│   │   │   ├── StatsPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── stores/               # Zustand stores
│   │   │   ├── authStore.js
│   │   │   ├── userStore.js
│   │   │   ├── questStore.js
│   │   │   ├── earnStore.js
│   │   │   └── uiStore.js
│   │   ├── services/             # API & Telegram SDK
│   │   │   ├── api.js
│   │   │   └── telegram.js
│   │   ├── utils/                # Helpers & constants
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   ├── favicon.svg
│   │   └── manifest.json
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
└── backend/
    └── miniapp-routes.js         # API routes to add to bot
```

---

## 🚀 Step 1: Frontend Setup (Mini App)

### 1.1 Copy Mini App Files

Copy the entire `app/` folder to your deployment location:

```bash
# On your local machine
scp -r /path/to/mintiq-miniapp/app ubuntu@your-server:/home/ubuntu/mintiq-miniapp/
```

Or clone/download to your local dev machine.

### 1.2 Install Dependencies

```bash
cd mintiq-miniapp/app
npm install
```

### 1.3 Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=https://api.mintiq.world
VITE_BOT_USERNAME=MintIQBot
VITE_ENABLE_ADS=true
VITE_ADSGRAM_BLOCK_ID=your-block-id
```

### 1.4 Development Mode

```bash
npm run dev
```

Open http://localhost:5173 in browser.

> **Note**: In development, mock data is used. Telegram SDK features won't work outside Telegram.

### 1.5 Build for Production

```bash
npm run build
```

Output is in `dist/` folder.

---

## 🔧 Step 2: Backend API Setup

### 2.1 Add Mini App Routes to Your Bot

Copy `backend/miniapp-routes.js` to your mintiq-bot repository:

```bash
cp miniapp-routes.js /path/to/mintiq-bot/src/routes/miniapp.js
```

### 2.2 Install JWT Dependency

In your mintiq-bot folder:

```bash
npm install jsonwebtoken
```

### 2.3 Register Routes in index.js

Edit `mintiq-bot/src/index.js`:

```javascript
// Add at top with other requires
const miniappRoutes = require('./routes/miniapp');

// Add with other route registrations (after app initialization)
app.use('/api/miniapp', miniappRoutes);
```

### 2.4 Add JWT Secret to Environment

Add to your `.env` file in mintiq-bot:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### 2.5 Restart Bot

```bash
pm2 restart mintiq-bot
```

---

## 🌐 Step 3: Deploy Mini App

### Option A: Deploy to Vercel (Recommended)

1. Push the `app/` folder to a GitHub repository

2. Connect to Vercel:
   - Go to vercel.com
   - Import your repository
   - Set root directory to `app`
   - Add environment variables
   - Deploy

3. Set custom domain: `app.mintiq.world`

### Option B: Deploy to Your EC2

1. Build locally:
```bash
npm run build
```

2. Copy dist to server:
```bash
scp -r dist/* ubuntu@your-server:/var/www/miniapp/
```

3. Configure Nginx:

```nginx
# /etc/nginx/sites-available/miniapp
server {
    listen 80;
    server_name app.mintiq.world;
    root /var/www/miniapp;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. Enable site & get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/miniapp /etc/nginx/sites-enabled/
sudo certbot --nginx -d app.mintiq.world
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📱 Step 4: Register Mini App in Telegram

### 4.1 Configure with BotFather

1. Open @BotFather on Telegram
2. Send `/mybots` → Select @MintIQBot
3. Click "Bot Settings" → "Menu Button"
4. Click "Configure menu button"
5. Enter URL: `https://app.mintiq.world`
6. Enter button text: "Open MintIQ"

### 4.2 Enable Web App Mode

1. In BotFather, go to your bot
2. Bot Settings → Menu Button → Configure
3. Set the Web App URL: `https://app.mintiq.world`

### 4.3 Test in Telegram

1. Open @MintIQBot in Telegram
2. Click the menu button (hamburger icon)
3. Mini App should launch!

---

## 🔄 Step 5: Database Updates

If you haven't already, add these columns to your users table:

```sql
-- Run on your PostgreSQL database
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_win_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_win_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'novice';
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS win_broadcasts_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT NOW();

-- Daily logins table (if not exists)
CREATE TABLE IF NOT EXISTS daily_logins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    login_date DATE NOT NULL,
    streak_count INTEGER DEFAULT 1,
    reward INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, login_date)
);
```

---

## ✅ Step 6: Verification Checklist

### Frontend Checks:
- [ ] `npm run dev` works locally
- [ ] `npm run build` completes without errors
- [ ] App loads at https://app.mintiq.world
- [ ] No console errors in browser

### Backend Checks:
- [ ] `/api/miniapp/auth` endpoint responds
- [ ] JWT authentication works
- [ ] Database queries succeed

### Telegram Checks:
- [ ] Menu button appears in bot
- [ ] Mini App opens from menu
- [ ] Authentication works (user data populated)
- [ ] Navigation between tabs works
- [ ] Back button works properly

### Feature Checks:
- [ ] Home page loads user data
- [ ] Quests display correctly
- [ ] Placing a bet works
- [ ] Daily reward claim works
- [ ] Transactions display
- [ ] Settings toggles work

---

## 🐛 Troubleshooting

### "Auth data expired" error
The Telegram initData is only valid for 1 hour. Make sure server time is correct:
```bash
timedatectl set-ntp true
```

### "Invalid hash" error
Check that `BOT_TOKEN` in your .env matches the token from BotFather.

### Blank screen in Mini App
1. Check browser console for errors
2. Ensure VITE_API_URL is correct
3. Check CORS is enabled on your API

### API calls fail with 401
1. Check JWT_SECRET is set
2. Verify token is being sent in Authorization header
3. Check token hasn't expired (7 day validity)

### Mini App doesn't open in Telegram
1. Verify Web App URL is HTTPS
2. Check SSL certificate is valid
3. Ensure BotFather configuration is correct

---

## 📊 Monitoring

### Add API Logging

In your miniapp-routes.js:

```javascript
// Add at top of file
router.use((req, res, next) => {
  console.log(`[MiniApp] ${req.method} ${req.path}`);
  next();
});
```

### PM2 Monitoring

```bash
pm2 logs mintiq-bot --lines 50
pm2 monit
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] CORS configured for your domains only

---

## 🎉 You're Done!

Your MintIQ Mini App should now be live and accessible via:
- Direct URL: https://app.mintiq.world
- Telegram Bot menu button
- Inline keyboard buttons with web_app URLs

### Next Steps:
1. Add Adsgram for rewarded ads
2. Implement push notifications
3. Add analytics tracking
4. Create weekly challenges
5. Build referral campaign features
