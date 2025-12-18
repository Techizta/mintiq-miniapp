import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Target, Flame, Award, BarChart3 } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { formatSatz, getTierInfo } from '../utils/helpers';

export default function StatsPage() {
  const { user } = useUserStore();
  const tierInfo = getTierInfo(user?.tier || user?.status_tier || 'newcomer');

  const stats = [
    { label: 'Total Predictions', value: user?.predictions_made || 0, icon: Target, color: 'text-mint-400' },
    { label: 'Predictions Won', value: user?.predictions_won || 0, icon: Trophy, color: 'text-gold-400' },
    { label: 'Win Rate', value: `${parseFloat(user?.win_rate || 0).toFixed(1)}%`, icon: BarChart3, color: 'text-green-400' },
    { label: 'Current Streak', value: user?.current_streak || 0, icon: Flame, color: 'text-orange-400' },
    { label: 'Best Streak', value: user?.best_streak || 0, icon: Award, color: 'text-purple-400' },
    { label: 'Win Streak', value: user?.current_win_streak || 0, icon: TrendingUp, color: 'text-blue-400' },
  ];

  const earnings = [
    { label: 'Total Earned', value: formatSatz(user?.total_earned || 0), color: 'text-green-400' },
    { label: 'Total Spent', value: formatSatz(user?.total_spent || 0), color: 'text-red-400' },
    { label: 'Total Won', value: formatSatz(user?.total_won || 0), color: 'text-gold-400' },
    { label: 'Net Profit', value: formatSatz((user?.total_earned || 0) - (user?.total_spent || 0)), color: 'text-mint-400' },
  ];

  // Simple tier progress calculation
  const tierPoints = user?.tier_points || 0;
  const tierLevels = [
    { name: 'Newcomer', points: 0, color: '#6b7280' },
    { name: 'Beginner', points: 100, color: '#22c55e' },
    { name: 'Skilled', points: 500, color: '#3b82f6' },
    { name: 'Expert', points: 2000, color: '#a855f7' },
    { name: 'Master', points: 5000, color: '#f59e0b' },
    { name: 'Legend', points: 10000, color: '#ef4444' },
  ];
  
  const currentTierIndex = tierLevels.findIndex(t => t.name.toLowerCase() === (user?.tier || user?.status_tier || 'newcomer').toLowerCase());
  const nextTier = tierLevels[currentTierIndex + 1];
  const currentTierPoints = tierLevels[currentTierIndex]?.points || 0;
  const progress = nextTier ? Math.min(100, ((tierPoints - currentTierPoints) / (nextTier.points - currentTierPoints)) * 100) : 100;

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Tier Card */}
      <div className="px-4 pt-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 rounded-xl p-4 border border-white/5" style={{ borderColor: tierInfo.color + '50' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-dark-400 mb-1">Current Tier</p>
              <h2 className="text-2xl font-bold" style={{ color: tierInfo.color }}>{tierInfo.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{tierInfo.multiplier}x</p>
              <p className="text-xs text-dark-400">multiplier</p>
            </div>
          </div>
          {nextTier && (
            <>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-dark-400">Progress to {nextTier.name}</span>
                <span style={{ color: nextTier.color }}>{tierPoints} / {nextTier.points}</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  className="h-full rounded-full" style={{ backgroundColor: nextTier.color }} />
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mb-4">
        <h3 className="text-sm font-medium text-dark-400 mb-3">Performance</h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-dark-800 rounded-xl p-4 border border-white/5">
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
