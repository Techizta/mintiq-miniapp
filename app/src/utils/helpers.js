/**
 * MintIQ Helpers - Updated with USD Value Display
 * Phase 2: Value Clarity - Show USD value everywhere
 */

// ============================================
// NUMBER FORMATTING
// ============================================

export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatSatz(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  return formatNumber(amount);
}

export function formatCompact(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const absNum = Math.abs(num);
  if (absNum >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (absNum >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (absNum >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

export function formatBTC(satoshis) {
  if (!satoshis || isNaN(satoshis)) return '0';
  return (satoshis / 100000000).toFixed(8).replace(/\.?0+$/, '');
}

// ============================================
// USD VALUE CONVERSION (Phase 2: Value Clarity)
// ============================================

// Default BTC price - will be updated from API
let cachedBtcPrice = 100000;

export function setBtcPrice(price) {
  if (price && !isNaN(price) && price > 0) {
    cachedBtcPrice = price;
  }
}

export function getBtcPrice() {
  return cachedBtcPrice;
}

/**
 * Convert SATZ to USD value
 * 1 SATZ = 1 satoshi = 0.00000001 BTC
 */
export function satzToUsd(satz, btcPrice = cachedBtcPrice) {
  if (!satz || isNaN(satz)) return 0;
  const btcValue = satz / 100000000;
  return btcValue * btcPrice;
}

/**
 * Format USD value with appropriate precision
 */
export function formatUSD(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(3)}`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

/**
 * Format SATZ with USD value inline
 * Example: "250 SATZ ($0.25)"
 */
export function formatSatzWithUsd(satz, btcPrice = cachedBtcPrice) {
  if (!satz || isNaN(satz)) return '0 SATZ ($0.00)';
  const usd = satzToUsd(satz, btcPrice);
  return `${formatNumber(satz)} SATZ (${formatUSD(usd)})`;
}

/**
 * Format just the USD part for inline display
 * Example: "$0.25"
 */
export function satzUsdValue(satz, btcPrice = cachedBtcPrice) {
  return formatUSD(satzToUsd(satz, btcPrice));
}

// ============================================
// WITHDRAWAL PROGRESS (Phase 2)
// ============================================

export const WITHDRAWAL_MINIMUM = 50000; // 50,000 SATZ minimum

/**
 * Calculate withdrawal progress
 */
export function getWithdrawalProgress(balance) {
  const current = Number(balance) || 0;
  const percentage = Math.min(100, (current / WITHDRAWAL_MINIMUM) * 100);
  const remaining = Math.max(0, WITHDRAWAL_MINIMUM - current);
  const canWithdraw = current >= WITHDRAWAL_MINIMUM;
  
  return {
    current,
    target: WITHDRAWAL_MINIMUM,
    percentage,
    remaining,
    canWithdraw,
    remainingUsd: satzToUsd(remaining),
  };
}

/**
 * Format remaining to milestone
 * Example: "You're 247 SATZ from your first $1!"
 */
export function formatToMilestone(balance) {
  const current = Number(balance) || 0;
  const milestones = [
    { satz: 1000, label: '$1' },
    { satz: 5000, label: '$5' },
    { satz: 10000, label: '$10' },
    { satz: 25000, label: '$25' },
    { satz: 50000, label: 'withdrawal' },
  ];
  
  for (const milestone of milestones) {
    if (current < milestone.satz) {
      const remaining = milestone.satz - current;
      return `${formatNumber(remaining)} SATZ to ${milestone.label}!`;
    }
  }
  return 'Ready to withdraw!';
}

// ============================================
// TIME FORMATTING
// ============================================

export function formatTimeRemaining(endDate) {
  if (!endDate) return 'N/A';
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatRelativeTime(date) {
  if (!date) return 'N/A';
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function formatDate(date, options = {}) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...options });
}

export function formatDateTime(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// ============================================
// PREDICTION CALCULATIONS
// ============================================

export function calculateOdds(poolA, poolB) {
  const a = Number(poolA) || 0;
  const b = Number(poolB) || 0;
  const total = a + b;
  if (total === 0) return { a: 50, b: 50 };
  return { a: Math.round((a / total) * 100), b: Math.round((b / total) * 100) };
}

export function calculateMultiplier(myPool, otherPool, fee = 0.1) {
  const my = Number(myPool) || 0;
  const other = Number(otherPool) || 0;
  if (my === 0) return 1;
  const multiplier = ((my + other) * (1 - fee)) / my;
  if (isNaN(multiplier) || !isFinite(multiplier)) return 1;
  return Math.min(multiplier, 1000);
}

export function calculatePotentialWin(betAmount, myPool, otherPool, fee = 0.1) {
  const bet = Number(betAmount) || 0;
  const my = Number(myPool) || 0;
  const other = Number(otherPool) || 0;
  if (bet === 0) return 0;
  const result = Math.floor(((my + bet + other) * (1 - fee)) * (bet / (my + bet)));
  return isNaN(result) ? bet : result;
}

// ============================================
// TIER SYSTEM
// ============================================

export const TIERS = {
  newcomer: { name: 'Newcomer', color: '#9CA3AF', emoji: '🌱', points: 0, multiplier: 1.0 },
  stacker: { name: 'Stacker', color: '#22C55E', emoji: '📦', points: 1000, multiplier: 1.1 },
  hodler: { name: 'Hodler', color: '#3B82F6', emoji: '💎', points: 5000, multiplier: 1.2 },
  whale: { name: 'Whale', color: '#8B5CF6', emoji: '🐋', points: 15000, multiplier: 1.3 },
  satoshi: { name: 'Satoshi', color: '#F59E0B', emoji: '⚡', points: 50000, multiplier: 1.5 },
  nakamoto: { name: 'Nakamoto', color: '#EF4444', emoji: '👑', points: 150000, multiplier: 2.0 },
};

export function getTierInfo(tier) {
  if (!tier) return TIERS.newcomer;
  const t = tier.toLowerCase();
  return TIERS[t] || TIERS.newcomer;
}

export function getTierProgress(tierPoints) {
  const points = Number(tierPoints) || 0;
  const tiers = Object.values(TIERS);
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (points >= tiers[i].points) {
      const next = tiers[i + 1];
      if (!next) return { current: tiers[i], next: null, progress: 100 };
      return { current: tiers[i], next, progress: Math.min(100, ((points - tiers[i].points) / (next.points - tiers[i].points)) * 100) };
    }
  }
  return { current: TIERS.newcomer, next: TIERS.stacker, progress: 0 };
}

// ============================================
// STREAK REWARDS
// ============================================

export const STREAK_REWARDS = {
  1: 10, 2: 20, 3: 35, 4: 50, 5: 75, 6: 100, 7: 150
};

export const STREAK_MILESTONES = {
  7: { reward: 200, badge: '🔥 Week Warrior' },
  14: { reward: 400, badge: '⚡ Fortnight Fighter' },
  30: { reward: 1000, badge: '👑 Monthly Master' },
  60: { reward: 2500, badge: '💎 Diamond Hands' },
  100: { reward: 5000, badge: '🏆 Century Legend' },
};

export function getStreakReward(day) {
  if (day <= 7) return STREAK_REWARDS[day] || 10;
  return Math.min(150 + (day - 7) * 10, 300); // Cap at 300
}

export function getStreakMultiplier(streak) {
  if (streak >= 30) return 1.5;
  if (streak >= 14) return 1.3;
  if (streak >= 7) return 1.2;
  if (streak >= 3) return 1.1;
  return 1.0;
}

// ============================================
// VALIDATION
// ============================================

export function isValidBTCAddress(address) {
  if (!address) return false;
  return [/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/, /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/, /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/].some(p => p.test(address));
}

export function isValidUsername(username) {
  if (!username) return false;
  return /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username.replace('@', ''));
}

// ============================================
// UTILITIES
// ============================================

export function generateId() { return Math.random().toString(36).substring(2) + Date.now().toString(36); }
export function truncate(str, length = 20) { return !str ? '' : str.length <= length ? str : str.substring(0, length) + '...'; }
export function truncateAddress(address, start = 6, end = 4) { return !address ? '' : address.length <= start + end ? address : `${address.slice(0, start)}...${address.slice(-end)}`; }
export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
export function debounce(func, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => func(...args), wait); }; }
export async function copyToClipboard(text) { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } }
export function getCategoryEmoji(cat) { return { crypto: '🪙', sports: '⚽', politics: '🏛️', entertainment: '🎬', finance: '📈' }[cat] || '🎯'; }
export function getTaskTypeIcon(type) { return { channel_join: '📢', website_visit: '🌐', twitter_follow: '🐦', bot_start: '🤖', miniapp_launch: '📱' }[type] || '📋'; }
export function cn(...classes) { return classes.filter(Boolean).join(' '); }
