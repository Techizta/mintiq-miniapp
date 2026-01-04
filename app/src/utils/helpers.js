export const formatSatz = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

export const formatCompact = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

export const formatTimeRemaining = (deadline) => {
  if (!deadline) return 'Open';
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return days + 'd ' + hours + 'h';
  if (hours > 0) return hours + 'h ' + minutes + 'm';
  return minutes + 'm';
};

export const getTierInfo = (tier) => {
  const tiers = {
    newcomer: { name: 'Newcomer', emoji: '🌱', color: '#888888', level: 1 },
    bronze: { name: 'Bronze', emoji: '🥉', color: '#CD7F32', level: 2 },
    silver: { name: 'Silver', emoji: '🥈', color: '#C0C0C0', level: 3 },
    gold: { name: 'Gold', emoji: '🥇', color: '#FFD700', level: 4 },
    platinum: { name: 'Platinum', emoji: '💎', color: '#E5E4E2', level: 5 },
    diamond: { name: 'Diamond', emoji: '💠', color: '#B9F2FF', level: 6 },
    whale: { name: 'Whale', emoji: '🐋', color: '#0EA5E9', level: 7 },
  };
  return tiers[tier?.toLowerCase()] || tiers.newcomer;
};

export const calculateOdds = (poolA, poolB) => {
  const a = Number(poolA) || 0;
  const b = Number(poolB) || 0;
  const total = a + b;
  if (total === 0) return { oddsA: 50, oddsB: 50 };
  return { oddsA: Math.round((a / total) * 100), oddsB: Math.round((b / total) * 100) };
};

export const calculateMultiplier = (myPool, otherPool) => {
  // myPool = pool for the option I'm betting on
  // otherPool = pool for the other option
  const my = Number(myPool) || 0;
  const other = Number(otherPool) || 0;
  const total = my + other;
  
  if (total === 0) return 1.8; // 2x minus 10% fee = 1.8x for empty pool
  if (my === 0) return 9.0;    // 10x minus 10% fee = 9x cap
  
  // Raw multiplier = total / myPool, then apply 10% fee
  const rawMultiplier = total / my;
  const afterFee = rawMultiplier * 0.9; // 10% platform fee
  return Math.max(1.0, Math.min(afterFee, 9.0)); // Cap at 9x, min 1x
};

export const calculatePotentialWin = (amount, myPool, otherPool) => {
  // Calculate what you'd win if you bet 'amount' on the side with 'myPool'
  const bet = Number(amount) || 0;
  const my = Number(myPool) || 0;
  const other = Number(otherPool) || 0;
  
  // After your bet, your pool increases
  const newMyPool = my + bet;
  const totalPool = newMyPool + other;
  
  // Winners share 90% (10% platform fee)
  const winnerPool = totalPool * 0.9;
  
  // Your share = (your_bet / winning_pool) * winner_pot
  if (newMyPool === 0) return 0;
  const yourShare = (bet / newMyPool) * winnerPool;
  
  return Math.floor(yourShare);
};

// Calculate multiplier AFTER your bet is placed
export const calculateMultiplierAfterBet = (betAmount, myPool, otherPool) => {
  const bet = Number(betAmount) || 0;
  if (bet === 0) return 0;
  
  const potentialWin = calculatePotentialWin(bet, myPool, otherPool);
  return potentialWin / bet;
};

export const satzUsdValue = (satz) => formatSatz(satz) + ' SATZ';
export const formatSatzWithUsd = (satz) => formatSatz(satz) + ' SATZ';

export const getCategoryEmoji = (category) => {
  const emojis = {
    crypto: '₿', bitcoin: '₿', sports: '⚽', football: '⚽', soccer: '⚽',
    basketball: '🏀', politics: '🏛', entertainment: '🎬', movies: '🎬',
    music: '🎵', tech: '💻', technology: '💻', gaming: '🎮', finance: '💰',
    stocks: '📈', weather: '🌤', science: '🔬', ai: '🤖', other: '🎯'
  };
  return emojis[category?.toLowerCase()] || '🎯';
};

export const getWithdrawalProgress = (balance, min) => {
  const minAmount = min || 50000;
  const percentage = Math.min((balance / minAmount) * 100, 100);
  return { percentage: percentage, canWithdraw: balance >= minAmount, remaining: Math.max(0, minAmount - balance) };
};

export const formatToMilestone = (balance, min) => {
  const minAmount = min || 50000;
  const remaining = Math.max(0, minAmount - balance);
  if (remaining === 0) return 'Ready to withdraw!';
  return formatSatz(remaining) + ' more to withdraw';
};

var currentBtcPrice = 100000;
export const setBtcPrice = (price) => { currentBtcPrice = price; };
export const getBtcPrice = () => currentBtcPrice;

export const shortenAddress = (address, chars) => {
  if (!address) return '';
  const c = chars || 6;
  return address.slice(0, c) + '...' + address.slice(-c);
};

export const isValidBtcAddress = (address) => {
  if (!address) return false;
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  if (/^bc1[a-z0-9]{39,59}$/i.test(address)) return true;
  return false;
};

export const debounce = (func, wait) => {
  var timeout;
  return function() { var args = arguments; var ctx = this; clearTimeout(timeout); timeout = setTimeout(function() { func.apply(ctx, args); }, wait); };
};

export const throttle = (func, limit) => {
  var inThrottle;
  return function() { var args = arguments; var ctx = this; if (!inThrottle) { func.apply(ctx, args); inThrottle = true; setTimeout(function() { inThrottle = false; }, limit); } };
};

export const copyToClipboard = async (text) => {
  try { await navigator.clipboard.writeText(text); return true; } 
  catch (e) { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); return true; }
};

export const generateReferralLink = (userId, botUsername) => 'https://t.me/' + (botUsername || 'MintIQBot') + '?start=ref_' + userId;
export const parseReferralCode = (startParam) => (startParam && startParam.startsWith('ref_')) ? startParam.replace('ref_', '') : null;
