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
export function formatUSD(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}
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
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 7) return new Date(date).toLocaleDateString();
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
export function formatDate(date, options = {}) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...options });
}
export function formatDateTime(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
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
export const TIERS = {
  newcomer: { name: 'Newcomer', color: '#9CA3AF', points: 0, multiplier: 1.0 },
  stacker: { name: 'Stacker', color: '#22C55E', points: 500, multiplier: 1.2 },
  hodler: { name: 'Hodler', color: '#3B82F6', points: 2000, multiplier: 1.5 },
  whale: { name: 'Whale', color: '#8B5CF6', points: 5000, multiplier: 1.8 },
  satoshi: { name: 'Satoshi', color: '#F59E0B', points: 15000, multiplier: 2.2 },
  nakamoto: { name: 'Nakamoto', color: '#EF4444', points: 50000, multiplier: 3.0 },
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
export function isValidBTCAddress(address) {
  if (!address) return false;
  return [/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/, /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/, /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/].some(p => p.test(address));
}
export function isValidUsername(username) {
  if (!username) return false;
  return /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username.replace('@', ''));
}
export function generateId() { return Math.random().toString(36).substring(2) + Date.now().toString(36); }
export function truncate(str, length = 20) { return !str ? '' : str.length <= length ? str : str.substring(0, length) + '...'; }
export function truncateAddress(address, start = 6, end = 4) { return !address ? '' : address.length <= start + end ? address : `${address.slice(0, start)}...${address.slice(-end)}`; }
export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
export function debounce(func, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => func(...args), wait); }; }
export async function copyToClipboard(text) { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } }
export function getCategoryEmoji(cat) { return { crypto: '🪙', sports: '⚽', politics: '🏛️', entertainment: '🎬' }[cat] || '🎯'; }
export function getTaskTypeIcon(type) { return { channel_join: '📢', website_visit: '🌐', twitter_follow: '🐦', bot_start: '🤖', miniapp_launch: '📱' }[type] || '📋'; }
export function cn(...classes) { return classes.filter(Boolean).join(' '); }
