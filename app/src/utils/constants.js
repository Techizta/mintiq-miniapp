/**
 * MintIQ Constants
 */

// ============================================
// APP CONFIG
// ============================================

export const APP_CONFIG = {
  name: 'MintIQ',
  tagline: 'Predict. Earn. Connect.',
  version: '1.0.0',
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
// LIMITS & THRESHOLDS
// ============================================

export const LIMITS = {
  MIN_BET: 10,
  MAX_BET: 1000000,
  MIN_CHALLENGE_STAKE: 500,
  MIN_REDEMPTION: 100000,
  MAX_ADS_PER_DAY: 5,
  MAX_FREE_PREDICTIONS: 1,
  BALANCE_PROTECTION: 50, // Can't bet last 50 SATZ
};

// ============================================
// REWARDS
// ============================================

export const REWARDS = {
  WELCOME_BONUS: 500,
  REFERRAL_BONUS_REFERRER: 50,
  REFERRAL_BONUS_REFEREE: 100,
  DAILY_LOGIN_BASE: 25,
  WEEKLY_BONUS: 500,
  COMEBACK_BONUS: 200,
  MYSTERY_BOX_MIN: 10,
  MYSTERY_BOX_MAX: 500,
  AD_REWARD_MIN: 20,
  AD_REWARD_MAX: 50,
  FREE_PREDICTION_VALUE: 50,
};

// ============================================
// FEES
// ============================================

export const FEES = {
  TREASURY_FEE: 0.10,
  VAULT_SHARE: 0.50,
  REDEMPTION_FEE: 0.02,
  REFERRAL_COMMISSION: 0.07,
};

// ============================================
// STREAK REWARDS
// ============================================

export const STREAK_REWARDS = {
  1: 25,
  2: 50,
  3: 100,
  4: 150,
  5: 250,
  6: 400,
  7: 750,
};

export const MILESTONE_REWARDS = {
  7: 500,    // Weekly bonus
  14: 1000,
  30: 5000,
  60: 10000,
  100: 15000,
};

// ============================================
// TIERS
// ============================================

export const TIERS = [
  { id: 'novice', name: 'Novice', points: 0, multiplier: 1.0, color: '#9CA3AF' },
  { id: 'apprentice', name: 'Apprentice', points: 500, multiplier: 1.2, color: '#22C55E' },
  { id: 'skilled', name: 'Skilled', points: 2000, multiplier: 1.5, color: '#3B82F6' },
  { id: 'expert', name: 'Expert', points: 5000, multiplier: 1.8, color: '#8B5CF6' },
  { id: 'master', name: 'Master', points: 15000, multiplier: 2.2, color: '#F59E0B' },
  { id: 'legend', name: 'Legend', points: 50000, multiplier: 3.0, color: '#EF4444' },
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
  },
  website_visit: {
    id: 'website_visit',
    name: 'Visit Website',
    icon: '🌐',
    description: 'Visit a website',
  },
  twitter_follow: {
    id: 'twitter_follow',
    name: 'Follow Twitter',
    icon: '🐦',
    description: 'Follow on Twitter/X',
  },
  bot_start: {
    id: 'bot_start',
    name: 'Start Bot',
    icon: '🤖',
    description: 'Start a Telegram bot',
  },
};

// ============================================
// SPIN WHEEL CONFIG
// ============================================

export const SPIN_WHEEL = {
  segments: [
    { value: 10, color: '#3B82F6', label: '10' },
    { value: 15, color: '#22C55E', label: '15' },
    { value: 20, color: '#8B5CF6', label: '20' },
    { value: 25, color: '#F59E0B', label: '25' },
    { value: 30, color: '#EF4444', label: '30' },
    { value: 40, color: '#EC4899', label: '40' },
    { value: 50, color: '#14B8A6', label: '50' },
    { value: 100, color: '#FFD700', label: '100' },
  ],
  duration: 5000, // ms
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
};
