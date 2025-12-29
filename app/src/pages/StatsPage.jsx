/**
 * MintIQ StatsPage - UPDATED + ENGAGEMENT
 */

import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Target, Flame, Award, BarChart3, Crown, Gift, Sparkles } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { formatSatz, getTierInfo } from '../utils/helpers';

// Engagement: Badges
import BadgesSection from '../components/features/BadgesSection';

const TIER_CONFIG = [
  { name: 'Newcomer', key: 'newcomer', threshold: 0, color: '#6b7280', levelBonus: 0, dailyBonus: 0 },
  { name: 'Stacker', key: 'stacker', threshold: 1000, color: '#22c55e', levelBonus: 250, dailyBonus: 5 },
  { name: 'Hodler', key: 'hodler', threshold: 5000, color: '#3b82f6', levelBonus: 500, dailyBonus: 10 },
  { name: 'Whale', key: 'whale', threshold: 15000, color: '#a855f7', levelBonus: 1500, dailyBonus: 20 },
  { name: 'Satoshi', key: 'satoshi', threshold: 50000, color: '#f59e0b', levelBonus: 5000, dailyBonus: 35 },
  { name: 'Nakamoto', key: 'nakamoto', threshold: 150000, color: '#ef4444', levelBonus: 15000, dailyBonus: 50 },
];

function calculateTier(totalEarned) {
  const earned = parseInt(totalEarned) || 0;
  let currentTier = TIER_CONFIG[0];
  for (let i = TIER_CONFIG.length - 1; i >= 0; i--) {
    if (earned >= TIER_CONFIG[i].threshold) {
      currentTier = TIER_CONFIG[i];
      break;
    }
  }
  return currentTier;
}

function getNextTier(currentTierKey) {
  const currentIndex = TIER_CONFIG.findIndex(t => t.key === currentTierKey);
  if (currentIndex < TIER_CONFIG.length - 1) {
    return TIER_CONFIG[currentIndex + 1];
  }
  return null;
}

function getTierEmoji(key) {
  const emojis = {
    newcomer: '🌱',
    stacker: '📦',
    hodler: '💎',
    whale: '🐋',
    satoshi: '⚡',
    nakamoto: '👑'
  };
  return emojis[key] || '🌱';
}

export default function StatsPage() {
  const { user } = useUserStore();
  
  const totalEarned = parseInt(user?.total_earned) || 0;
  const currentTier = calculateTier(totalEarned);
  const nextTier = getNextTier(currentTier.key);
  
  let progress = 100;
  let progressDisplay = '';
  let satzToNextTier = 0;
  
  if (nextTier) {
    const currentThreshold = currentTier.threshold;
    const nextThreshold = nextTier.threshold;
    const earnedInTier = totalEarned - currentThreshold;
    const neededForNext = nextThreshold - currentThreshold;
    progress = Math.min(100, (earnedInTier / neededForNext) * 100);
    progressDisplay = `${formatSatz(totalEarned)} / ${formatSatz(nextThreshold)}`;
    satzToNextTier = nextThreshold - totalEarned;
  }

  const stats = [
    { label: 'Total Predictions', value: user?.predictions_made || 0, icon: Target, color: 'text-mint-400' },
    { label: 'Predictions Won', value: user?.predictions_won || 0, icon: Trophy, color: 'text-gold-400' },
    { label: 'Win Rate', value: `${parseFloat(user?.win_rate || 0).toFixed(1)}%`, icon: BarChart3, color: 'text-green-400' },
    { label: 'Current Streak', value: user?.current_streak || 0, icon: Flame, color: 'text-orange-400' },
    { label: 'Best Streak', value: user?.best_streak || 0, icon: Award, color: 'text-purple-400' },
    { label: 'Win Streak', value: user?.win_streak || 0, icon: TrendingUp, color: 'text-blue-400' },
  ];

  const earnings = [
    { label: 'Total Earned', value: formatSatz(user?.total_earned || 0), color: 'text-green-400' },
    { label: 'Total Spent', value: formatSatz(user?.total_spent || 0), color: 'text-red-400' },
    { label: 'Total Won', value: formatSatz(user?.total_won || 0), color: 'text-gold-400' },
    { label: 'Net Profit', value: formatSatz((user?.total_earned || 0) - (user?.total_spent || 0)), color: 'text-mint-400' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Current Tier Card */}
      <div className="px-4 pt-4 mb-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 rounded-xl p-4 border border-white/5" 
          style={{ borderColor: currentTier.color + '50' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: currentTier.color + '20' }}
              >
                {getTierEmoji(currentTier.key)}
              </div>
              <div>
                <p className="text-sm text-dark-400 mb-0.5">Current Tier</p>
                <h2 className="text-xl font-bold" style={{ color: currentTier.color }}>
                  {currentTier.name}
                </h2>
              </div>
            </div>
            {currentTier.dailyBonus > 0 && (
              <div className="text-right bg-dark-700 rounded-lg px-3 py-2">
                <p className="text-lg font-bold text-mint-400">+{currentTier.dailyBonus}</p>
                <p className="text-xs text-dark-400">daily bonus</p>
              </div>
            )}
          </div>
          
          {nextTier ? (
            <div className="bg-dark-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-dark-400">Progress to {nextTier.name}</span>
                <span style={{ color: nextTier.color }}>{progressDisplay}</span>
              </div>
              <div className="h-2 bg-dark-600 rounded-full overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full" 
                  style={{ backgroundColor: nextTier.color }} 
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-dark-500">
                  {formatSatz(satzToNextTier)} more to level up
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <Gift size={12} className="text-gold-400" />
                  <span className="text-gold-400 font-bold">+{formatSatz(nextTier.levelBonus)} bonus</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gold-500/10 rounded-lg p-3 border border-gold-500/30">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-gold-400" />
                <span className="text-gold-400 font-medium">Maximum Tier Reached!</span>
              </div>
              <p className="text-xs text-dark-400 mt-1">
                You've achieved the highest tier. Enjoy +{currentTier.dailyBonus} SATZ daily bonus!
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Engagement: Badges Section */}
      <div className="px-4 mb-4">
        <BadgesSection />
      </div>

      {/* Tier Rewards Overview */}
      <div className="px-4 mb-4">
        <h3 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-gold-400" />
          Tier Rewards
        </h3>
        <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-dark-700/50 text-xs text-dark-400">
            <div className="col-span-5">Tier</div>
            <div className="col-span-4 text-center">Level-Up Bonus</div>
            <div className="col-span-3 text-right">Daily</div>
          </div>
          
          {TIER_CONFIG.map((tier, index) => {
            const isCurrentTier = tier.key === currentTier.key;
            const isAchieved = totalEarned >= tier.threshold;
            const isNextTier = nextTier && tier.key === nextTier.key;
            
            return (
              <div 
                key={tier.key}
                className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-t border-white/5 ${
                  isCurrentTier ? 'bg-dark-700/30' : ''
                } ${!isAchieved && !isNextTier ? 'opacity-50' : ''}`}
              >
                <div className="col-span-5 flex items-center gap-2">
                  <span className="text-lg">{getTierEmoji(tier.key)}</span>
                  <div>
                    <span 
                      className={`font-medium text-sm ${isAchieved ? 'text-white' : 'text-dark-400'}`}
                      style={isCurrentTier ? { color: tier.color } : {}}
                    >
                      {tier.name}
                    </span>
                    {isCurrentTier && (
                      <span className="ml-2 text-xs bg-mint-500/20 text-mint-400 px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="col-span-4 text-center">
                  {tier.levelBonus > 0 ? (
                    <span className={`font-bold text-sm ${
                      isAchieved ? 'text-dark-500 line-through' : 
                      isNextTier ? 'text-gold-400' : 'text-dark-400'
                    }`}>
                      +{formatSatz(tier.levelBonus)}
                    </span>
                  ) : (
                    <span className="text-dark-600 text-xs">—</span>
                  )}
                </div>
                
                <div className="col-span-3 text-right">
                  {tier.dailyBonus > 0 ? (
                    <span className={`font-medium text-sm ${
                      isCurrentTier ? 'text-mint-400' : 
                      isAchieved ? 'text-dark-500' : 'text-dark-400'
                    }`}>
                      +{tier.dailyBonus}/day
                    </span>
                  ) : (
                    <span className="text-dark-600 text-xs">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-dark-500 mt-2 px-1">
          💡 Level-up bonuses are awarded once when you reach each tier
        </p>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mb-4">
        <h3 className="text-sm font-medium text-dark-400 mb-3">Performance</h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              className="bg-dark-800 rounded-xl p-4 border border-white/5"
            >
              <stat.icon size={20} className={`${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-dark-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Earnings */}
      <div className="px-4">
        <h3 className="text-sm font-medium text-dark-400 mb-3">Earnings</h3>
        <div className="bg-dark-800 rounded-xl border border-white/5 divide-y divide-white/5">
          {earnings.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4">
              <span className="text-dark-400">{item.label}</span>
              <span className={`font-bold ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
