/**
 * MintIQ Constants
 * Updated for 1:1 Peg Model: 1 SATZ = 1 Satoshi (Always)
 */

// ============================================
// APP CONFIG
// ============================================

export const APP_CONFIG = {
  name: 'MintIQ',
  tagline: '1 SATZ = 1 Satoshi. Real Bitcoin Value.',
  version: '2.0.0',
  botUsername: 'MintIQBot',
  website: 'https://mintiq.world',
  support: 'support@mintiq.world',
};

// ============================================
// API CONFIG
// ============================================

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.mintiq.world',
  timeout: 30000,
};

// ============================================
// LIMITS & THRESHOLDS - Updated for 1:1 peg
// ============================================

export const LIMITS = {
  MIN_BET: 10,
  MAX_BET: 100000,
  MIN_CHALLENGE_STAKE: 25,
  MIN_REDEMPTION: 50000,       // 50,000 SATZ = 50,000 sats (~$50)
  MAX_ADS_PER_DAY: 10,
  MAX_FREE_PREDICTIONS: 1,
  BALANCE_PROTECTION: 50,
  USER_DAILY_CAP: 5000,        // Max SATZ per user per day
};

// ============================================
// REWARDS - Updated for 1:1 peg (sustainable)
// ============================================

export const REWARDS = {
  WELCOME_BONUS: 250,          // ~$0.25
  REFERRAL_BONUS_REFERRER: 100, // ~$0.10
  REFERRAL_BONUS_REFEREE: 150,  // ~$0.15
  DAILY_LOGIN_BASE: 10,        // Day 1
  WEEKLY_BONUS: 200,           // 7-day milestone
  COMEBACK_BONUS: 100,         // ~$0.10
  MYSTERY_BOX_MIN: 5,
  MYSTERY_BOX_MAX: 2500,
  AD_REWARD: 2,                // Fixed 2 SATZ per ad
  FREE_PREDICTION_VALUE: 50,
  FIRST_TASK_BONUS: 200,       // ~$0.20
  FIRST_PREDICTION_BONUS: 100, // ~$0.10
  PREMIUM_WEEKLY_DROP: 600,    // ~$0.60/week
};

// ============================================
// FEES
// ============================================

export const FEES = {
  TREASURY_FEE: 0.05,          // 5% on predictions
  VAULT_SHARE: 0.50,           // 50% of revenue to vault
  REDEMPTION_FEE: 0.02,        // 2% redemption fee
  REFERRAL_COMMISSION: 0.07,   // 7% lifetime commission
};

// ============================================
// STREAK REWARDS - Updated for sustainability
// ============================================

export const STREAK_REWARDS = {
  1: 10,    // ~$0.01
  2: 20,    // ~$0.02
  3: 35,    // ~$0.035
  4: 50,    // ~$0.05
  5: 75,    // ~$0.075
  6: 100,   // ~$0.10
  7: 150,   // ~$0.15
};

export const MILESTONE_REWARDS = {
  7: 200,      // 🔥 Week Warrior
  14: 400,     // ⚡ Fortnight Fighter
  30: 1000,    // 👑 Monthly Master
  60: 2500,    // 💎 Diamond Hands
  100: 5000,   // 🏆 Century Legend
  365: 25000,  // 🌟 Year One OG
};

// ============================================
// TIERS
// ============================================

export const TIERS = [
  { id: 'novice', name: 'Novice', points: 0, multiplier: 1.0, color: '#9CA3AF' },
  { id: 'apprentice', name: 'Apprentice', points: 500, multiplier: 1.1, color: '#22C55E' },
  { id: 'skilled', name: 'Skilled', points: 2000, multiplier: 1.2, color: '#3B82F6' },
  { id: 'expert', name: 'Expert', points: 5000, multiplier: 1.3, color: '#8B5CF6' },
  { id: 'master', name: 'Master', points: 15000, multiplier: 1.5, color: '#F59E0B' },
  { id: 'legend', name: 'Legend', points: 50000, multiplier: 2.0, color: '#EF4444' },
];

// ============================================
// CATEGORIES
// ============================================

export const CATEGORIES = [
  { id: 'all', name: 'All', emoji: '🔥' },
  { id: 'crypto', name: 'Crypto', emoji: '🪙' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'politics', name: 'Politics', emoji: '🏛️' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { id: 'other', name: 'Other', emoji: '🎯' },
];

// ============================================
// TASK TYPES
// ============================================

export const TASK_TYPES = {
  channel_join: {
    id: 'channel_join',
    name: 'Join Channel',
    icon: '📢',
    description: 'Join a Telegram channel',
    reward: 100,
  },
  website_visit: {
    id: 'website_visit',
    name: 'Visit Website',
    icon: '🌐',
    description: 'Visit a website',
    reward: 50,
  },
  twitter_follow: {
    id: 'twitter_follow',
    name: 'Follow Twitter',
    icon: '🐦',
    description: 'Follow on Twitter/X',
    reward: 150,
  },
  bot_start: {
    id: 'bot_start',
    name: 'Start Bot',
    icon: '🤖',
    description: 'Start a Telegram bot',
    reward: 75,
  },
};

// ============================================
// SPIN WHEEL CONFIG - Lower rewards
// ============================================

export const SPIN_WHEEL = {
  segments: [
    { value: 1, color: '#3B82F6', label: '1' },
    { value: 2, color: '#22C55E', label: '2' },
    { value: 3, color: '#8B5CF6', label: '3' },
    { value: 5, color: '#F59E0B', label: '5' },
    { value: 7, color: '#EF4444', label: '7' },
    { value: 10, color: '#EC4899', label: '10' },
    { value: 15, color: '#14B8A6', label: '15' },
    { value: 20, color: '#FFD700', label: '20' },
  ],
  duration: 5000,
  minSpins: 5,
};

// ============================================
// ANIMATIONS
// ============================================

export const ANIMATIONS = {
  pageTransition: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    transition: { duration: 0.2 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 },
  },
  stagger: {
    container: {
      animate: { transition: { staggerChildren: 0.05 } },
    },
    item: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    },
  },
};

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  HOME: '/',
  PREDICT: '/predict',
  QUEST_DETAIL: '/predict/:questId',
  EARN: '/earn',
  TASKS: '/earn/tasks',
  WALLET: '/wallet',
  TRANSACTIONS: '/wallet/transactions',
  REDEEM: '/wallet/redeem',
  MORE: '/more',
  FRIENDS: '/friends',
  CHALLENGES: '/challenges',
  GROUPS: '/groups',
  GROUP_DETAIL: '/groups/:groupId',
  LEADERBOARD: '/leaderboard',
  VAULT: '/vault',
  SHOP: '/shop',
  BOOSTERS: '/boosters',
  STATS: '/stats',
  SETTINGS: '/settings',
  PREMIUM: '/premium',
};

// ============================================
// NAV ITEMS
// ============================================

export const NAV_ITEMS = [
  { id: 'home', path: '/', label: 'Home', icon: 'Home' },
  { id: 'predict', path: '/predict', label: 'Predict', icon: 'Target' },
  { id: 'earn', path: '/earn', label: 'Earn', icon: 'Gift' },
  { id: 'wallet', path: '/wallet', label: 'Wallet', icon: 'Wallet' },
  { id: 'more', path: '/more', label: 'More', icon: 'MoreHorizontal' },
];

// ============================================
// ERROR MESSAGES
// ============================================

export const ERRORS = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please restart the app.',
  INSUFFICIENT_BALANCE: 'Insufficient SATZ balance.',
  MIN_BET: `Minimum bet is ${LIMITS.MIN_BET} SATZ.`,
  ALREADY_BET: 'You have already placed a bet on this quest.',
  QUEST_CLOSED: 'This quest is no longer accepting bets.',
  GENERIC: 'Something went wrong. Please try again.',
  DAILY_LIMIT: 'Daily earning limit reached. Come back tomorrow!',
};

// ============================================
// 1:1 PEG HELPERS
// ============================================

export const satzToSatoshi = (satz) => satz; // 1:1 always!

export const satzToUsd = (satz, btcPrice = 100000) => {
  return (satz / 100000000) * btcPrice;
};

export const formatSatzWithUsd = (satz, btcPrice = 100000) => {
  const usd = satzToUsd(satz, btcPrice);
  return `${satz.toLocaleString()} SATZ (~$${usd.toFixed(2)})`;
};

// ============================================
// VALUE PROPOSITION MESSAGES
// ============================================

export const VALUE_MESSAGES = {
  pegExplanation: '1 SATZ = 1 real satoshi. No tricks, no dilution.',
  redemptionClear: 'Redeem anytime at 1:1 rate (minus 2% fee).',
  trustMessage: 'Unlike other apps, your SATZ never loses value.',
  earnReal: 'Every SATZ you earn is backed by real Bitcoin.',
};
