import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gift, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  Flame,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useQuestStore } from '../stores/questStore';
import { useEarnStore } from '../stores/earnStore';
import { useUIStore } from '../stores/uiStore';
import telegram from '../services/telegram';
import { formatSatz, formatCompact, getTierInfo, formatTimeRemaining, calculateOdds } from '../utils/helpers';

export default function HomePage() {
  const { user, fetchUser } = useUserStore();
  const { quests, fetchQuests } = useQuestStore();
  const { dailyReward, fetchDailyReward, claimDailyReward } = useEarnStore();
  const { showToast, showCelebration } = useUIStore();

  useEffect(() => {
    fetchUser();
    fetchQuests({ limit: 3 });
    fetchDailyReward();
  }, []);

  const tierInfo = getTierInfo(user?.tier || 'novice');
  const hotQuest = quests[0];

  const handleClaimDaily = async () => {
    if (!dailyReward?.canClaim) return;
    
    telegram.hapticImpact('medium');
    
    try {
      const result = await claimDailyReward();
      showCelebration('daily', { 
        amount: result?.reward || dailyReward.streakReward,
        streak: dailyReward.currentStreak + 1
      });
    } catch (error) {
      showToast(error.message || 'Failed to claim reward', 'error');
    }
  };

  return (
    <div className="pb-4">
      {/* User Header */}
      <div className="bg-gradient-to-b from-dark-850 to-dark-950 px-4 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: tierInfo.color + '33' }}
            >
              {user?.first_name?.[0] || '👤'}
            </div>
            <div 
              className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-2xs font-bold text-white"
              style={{ backgroundColor: tierInfo.color }}
            >
              {tierInfo.name}
            </div>
          </div>

          {/* User info */}
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">
              {user?.first_name || 'Predictor'}
            </h1>
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <Flame size={14} className="text-orange-500" />
              <span>{user?.current_streak || 0} day streak</span>
            </div>
          </div>

          {/* Balance */}
          <Link to="/wallet" className="text-right">
            <p className="text-2xs text-dark-400 uppercase">Balance</p>
            <p className="text-lg font-bold text-gradient-gold">
              {formatSatz(user?.satz_balance)} <span className="text-sm">SATZ</span>
            </p>
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-800/50 rounded-xl p-3 text-center">
            <Trophy size={18} className="mx-auto mb-1 text-gold-400" />
            <p className="text-lg font-bold text-white">{user?.predictions_won || 0}</p>
            <p className="text-2xs text-dark-400">Wins</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-3 text-center">
            <Target size={18} className="mx-auto mb-1 text-mint-400" />
            <p className="text-lg font-bold text-white">{user?.win_rate?.toFixed(0) || 0}%</p>
            <p className="text-2xs text-dark-400">Win Rate</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-3 text-center">
            <TrendingUp size={18} className="mx-auto mb-1 text-success" />
            <p className="text-lg font-bold text-white">{formatCompact(user?.total_won || 0)}</p>
            <p className="text-2xs text-dark-400">Total Won</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Daily Reward Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                dailyReward?.canClaim ? 'bg-gold-gradient animate-pulse' : 'bg-dark-700'
              }`}>
                <Gift size={24} className={dailyReward?.canClaim ? 'text-dark-900' : 'text-dark-400'} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Daily Reward</h3>
                <p className="text-sm text-dark-400">
                  {dailyReward?.canClaim 
                    ? `Claim ${formatSatz(dailyReward.streakReward)} SATZ!`
                    : 'Come back tomorrow!'
                  }
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClaimDaily}
              disabled={!dailyReward?.canClaim}
              className={`px-4 py-2 rounded-xl font-semibold text-sm ${
                dailyReward?.canClaim 
                  ? 'bg-gold-gradient text-dark-900' 
                  : 'bg-dark-700 text-dark-400'
              }`}
            >
              {dailyReward?.canClaim ? 'Claim' : 'Claimed ✓'}
            </motion.button>
          </div>

          {/* Streak progress */}
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`flex-1 h-1.5 rounded-full ${
                  day <= (dailyReward?.currentStreak || 0)
                    ? 'bg-gold-gradient'
                    : 'bg-dark-700'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Hot Quest */}
        {hotQuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap size={18} className="text-gold-400" />
                Hot Quest
              </h2>
              <Link to="/predict" className="text-mint-400 text-sm flex items-center">
                View all <ChevronRight size={16} />
              </Link>
            </div>

            <Link to={`/predict/${hotQuest.id}`}>
              <div className="card card-hover p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-primary">
                    🪙 Crypto
                  </span>
                  <span className="text-sm text-dark-400">
                    ⏰ {formatTimeRemaining(hotQuest.betting_deadline)}
                  </span>
                </div>

                <h3 className="font-semibold text-white mb-4 line-clamp-2">
                  {hotQuest.title}
                </h3>

                {/* Options with odds */}
                <div className="space-y-2">
                  {['a', 'b'].map((opt) => {
                    const odds = calculateOdds(hotQuest.pool_a, hotQuest.pool_b);
                    const optOdds = opt === 'a' ? odds.a : odds.b;
                    const optText = opt === 'a' ? hotQuest.option_a : hotQuest.option_b;
                    
                    return (
                      <div
                        key={opt}
                        className="flex items-center justify-between bg-dark-800 rounded-lg p-3"
                      >
                        <span className="text-white text-sm">{optText}</span>
                        <span className={`font-bold ${opt === 'a' ? 'text-mint-400' : 'text-danger'}`}>
                          {optOdds}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Pool info */}
                <div className="flex items-center justify-between mt-3 text-sm text-dark-400">
                  <span>💰 {formatCompact(hotQuest.total_pool)} SATZ pool</span>
                  <span>👥 {hotQuest.participant_count} players</span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <Link to="/earn" className="card card-hover p-4">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center mb-2">
              <Gift size={20} className="text-success" />
            </div>
            <h3 className="font-semibold text-white">Earn SATZ</h3>
            <p className="text-sm text-dark-400">Complete tasks</p>
          </Link>

          <Link to="/friends" className="card card-hover p-4">
            <div className="w-10 h-10 rounded-xl bg-mint-500/20 flex items-center justify-center mb-2">
              <Users size={20} className="text-mint-400" />
            </div>
            <h3 className="font-semibold text-white">Invite Friends</h3>
            <p className="text-sm text-dark-400">Earn 7% lifetime</p>
          </Link>
        </motion.div>

        {/* Referral Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/friends">
            <div className="card bg-mint-gradient p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white mb-1">Invite & Earn</h3>
                  <p className="text-sm text-white/80">
                    Get 100 SATZ + 7% of their earnings forever!
                  </p>
                </div>
                <ChevronRight size={24} className="text-white" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
