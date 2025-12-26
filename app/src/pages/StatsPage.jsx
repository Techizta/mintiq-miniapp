/**
 * MintIQ StatsPage - FIXED
 * 
 * FIXES:
 * 1. Uses correct tier names: newcomer, stacker, hodler, whale, satoshi, nakamoto
 * 2. Uses total_earned for tier progress (not tier_points)
 * 3. Shows "Max Tier Reached" for nakamoto users
 */

import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Target, Flame, Award, BarChart3, Crown } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { formatSatz, getTierInfo } from '../utils/helpers';

// FIXED: Correct MintIQ tier configuration based on total_earned
const TIER_CONFIG = [
  { name: 'Newcomer', key: 'newcomer', threshold: 0, color: '#6b7280', multiplier: '1x' },
  { name: 'Stacker', key: 'stacker', threshold: 1000, color: '#22c55e', multiplier: '1.1x' },
  { name: 'Hodler', key: 'hodler', threshold: 5000, color: '#3b82f6', multiplier: '1.25x' },
  { name: 'Whale', key: 'whale', threshold: 15000, color: '#a855f7', multiplier: '1.5x' },
  { name: 'Satoshi', key: 'satoshi', threshold: 50000, color: '#f59e0b', multiplier: '1.75x' },
  { name: 'Nakamoto', key: 'nakamoto', threshold: 150000, color: '#ef4444', multiplier: '2x' },
];

// Calculate tier from total_earned
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

// Get next tier info
function getNextTier(currentTierKey) {
  const currentIndex = TIER_CONFIG.findIndex(t => t.key === currentTierKey);
  if (currentIndex < TIER_CONFIG.length - 1) {
    return TIER_CONFIG[currentIndex + 1];
  }
  return null; // Max tier reached
}

export default function StatsPage() {
  const { user } = useUserStore();
  
  // FIXED: Calculate tier from total_earned
  const totalEarned = parseInt(user?.total_earned) || 0;
  const currentTier = calculateTier(totalEarned);
  const nextTier = getNextTier(currentTier.key);
  
  // Calculate progress to next tier
  let progress = 100;
  let progressDisplay = '';
  
  if (nextTier) {
    const currentThreshold = currentTier.threshold;
    const nextThreshold = nextTier.threshold;
    const earnedInTier = totalEarned - currentThreshold;
    const neededForNext = nextThreshold - currentThreshold;
    progress = Math.min(100, (earnedInTier / neededForNext) * 100);
    progressDisplay = `${formatSatz(totalEarned)} / ${formatSatz(nextThreshold)}`;
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
      {/* Tier Card - FIXED */}
      <div className="px-4 pt-4 mb-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 rounded-xl p-4 border border-white/5" 
          style={{ borderColor: currentTier.color + '50' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-dark-400 mb-1">Current Tier</p>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold" style={{ color: currentTier.color }}>
                  {currentTier.name}
                </h2>
                {currentTier.key === 'nakamoto' && (
                  <Crown size={20} className="text-gold-400" />
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{currentTier.multiplier}</p>
              <p className="text-xs text-dark-400">multiplier</p>
            </div>
          </div>
          
          {/* Progress Section - FIXED */}
          {nextTier ? (
            <>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-dark-400">Progress to {nextTier.name}</span>
                <span style={{ color: nextTier.color }}>{progressDisplay}</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full" 
                  style={{ backgroundColor: nextTier.color }} 
                />
              </div>
              <p className="text-xs text-dark-500 mt-2">
                Earn {formatSatz(nextTier.threshold - totalEarned)} more SATZ to reach {nextTier.name}
              </p>
            </>
          ) : (
            <div className="bg-gold-500/10 rounded-lg p-3 border border-gold-500/30">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-gold-400" />
                <span className="text-gold-400 font-medium">Maximum Tier Reached!</span>
              </div>
              <p className="text-xs text-dark-400 mt-1">
                You've achieved the highest tier. Enjoy 2x earnings multiplier!
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* All Tiers Overview */}
      <div className="px-4 mb-4">
        <h3 className="text-sm font-medium text-dark-400 mb-3">Tier Progression</h3>
        <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
          <div className="space-y-3">
            {TIER_CONFIG.map((tier, index) => {
              const isCurrentTier = tier.key === currentTier.key;
              const isAchieved = totalEarned >= tier.threshold;
              
              return (
                <div 
                  key={tier.key}
                  className={`flex items-center justify-between py-2 ${
                    isCurrentTier ? 'bg-dark-700/50 -mx-2 px-2 rounded-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-3 h-3 rounded-full ${isAchieved ? '' : 'opacity-30'}`}
                      style={{ backgroundColor: tier.color }}
                    />
                    <span className={`font-medium ${isAchieved ? 'text-white' : 'text-dark-500'}`}>
                      {tier.name}
                    </span>
                    {isCurrentTier && (
                      <span className="text-xs bg-mint-500/20 text-mint-400 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={isAchieved ? 'text-dark-400' : 'text-dark-600'}>
                      {formatSatz(tier.threshold)}
                    </span>
                    <span 
                      className="font-bold w-12 text-right"
                      style={{ color: isAchieved ? tier.color : '#4b5563' }}
                    >
                      {tier.multiplier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
