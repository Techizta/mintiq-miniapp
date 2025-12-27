/**
 * MintIQ HomePage - REDESIGNED
 * 
 * Phase 1: Prediction-First Flow
 * - Featured prediction on first screen (no menus)
 * - Immediate value display (USD)
 * - Quest bridge while prediction resolves
 * - Withdrawal progress visible
 * 
 * Phase 2: Value Clarity
 * - USD value alongside SATZ everywhere
 * - Progress to withdrawal bar
 * - SATZ tooltip explaining value
 * 
 * Phase 3: Gamification
 * - First prediction bonus
 * - Streak multiplier display
 * - Live activity feed (social proof)
 */

import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  Flame,
  Trophy,
  Target,
  Zap,
  Sparkles,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useQuestStore } from '../stores/questStore';
import { useEarnStore } from '../stores/earnStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
// Note: SharedComponents available at ../components/shared/SharedComponents if needed
import { 
  formatSatz, 
  formatCompact, 
  getTierInfo, 
  formatTimeRemaining, 
  calculateOdds,
  satzUsdValue,
  formatSatzWithUsd,
  getWithdrawalProgress,
  formatToMilestone,
  getStreakMultiplier,
  setBtcPrice
} from '../utils/helpers';

// ============================================
// CONSTANTS
// ============================================

const WITHDRAWAL_MIN = 50000;
const FIRST_PREDICTION_BONUS = 100;

export default function HomePage() {
  const navigate = useNavigate();
  const { user, fetchUser } = useUserStore();
  const { quests, fetchQuests } = useQuestStore();
  const { dailyReward, fetchDailyReward, claimDailyReward } = useEarnStore();
  const { showToast, showCelebration } = useUIStore();
  
  // Local state
  const [featuredQuest, setFeaturedQuest] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [liveActivity, setLiveActivity] = useState([]);
  const [btcPrice, setBtcPriceState] = useState(100000);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // DATA FETCHING
  // ============================================
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUser(),
          fetchQuests({ limit: 5 }),
          fetchDailyReward(),
          fetchLiveStats(),
        ]);
      } catch (e) {
        console.error('Home data load error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  // Set featured quest from quests
  useEffect(() => {
    if (quests?.length > 0) {
      // Pick the quest with highest pool or most participants
      const sorted = [...quests].sort((a, b) => {
        const poolA = (Number(a.pool_a) || 0) + (Number(a.pool_b) || 0);
        const poolB = (Number(b.pool_a) || 0) + (Number(b.pool_b) || 0);
        return poolB - poolA;
      });
      setFeaturedQuest(sorted[0]);
    }
  }, [quests]);
  
  const fetchLiveStats = async () => {
    try {
      const response = await api.get('/api/miniapp/public/stats');
      if (response) {
        setLiveStats(response);
        if (response.btcPrice) {
          setBtcPrice(response.btcPrice);
          setBtcPriceState(response.btcPrice);
        }
        if (response.recentWinners) {
          setLiveActivity(response.recentWinners.map(w => ({
            type: 'win',
            name: w.name || 'Anonymous',
            action: 'won',
            amount: w.amount,
            time: w.time
          })));
        }
      }
    } catch (e) {
      console.error('Live stats error:', e);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleClaimDaily = async () => {
    if (!dailyReward?.canClaim) return;
    telegram.hapticImpact('medium');
    
    try {
      const result = await claimDailyReward();
      showCelebration('daily', { 
        amount: result?.reward || dailyReward.streakReward,
        streak: dailyReward.currentStreak + 1
      });
      fetchUser(true);
    } catch (error) {
      showToast(error.message || 'Failed to claim reward', 'error');
    }
  };
  
  const handleQuickPredict = (questId, option) => {
    telegram.hapticSelection();
    navigate(`/predict/${questId}?option=${option}`);
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const tierInfo = getTierInfo(user?.tier || user?.status_tier || 'newcomer');
  const balance = Number(user?.satz_balance) || 0;
  const balanceUsd = satzUsdValue(balance, btcPrice);
  const withdrawalProgress = getWithdrawalProgress(balance);
  const currentStreak = Number(user?.current_streak) || 0;
  const streakMultiplier = getStreakMultiplier(currentStreak);
  const isFirstPrediction = !user?.first_prediction_bonus_claimed && (user?.predictions_made || 0) === 0;

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      {/* ============================================ */}
      {/* HEADER - Balance & Streak */}
      {/* ============================================ */}
      <div className="bg-gradient-to-b from-dark-850 via-dark-900 to-dark-950 px-4 pt-5 pb-6">
        {/* Top row - User & Balance */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div 
              className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: tierInfo.color + '33', color: tierInfo.color }}
            >
              {user?.first_name?.[0] || '👤'}
            </div>
            <div>
              <h1 className="text-base font-bold text-white">
                {user?.first_name || 'Predictor'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs">
                <span style={{ color: tierInfo.color }}>{tierInfo.emoji}</span>
                <span className="text-dark-400">{tierInfo.name}</span>
              </div>
            </div>
          </div>
          
          {/* Balance - Prominent with USD */}
          <Link to="/wallet" className="text-right">
            <p className="text-xl font-bold text-gradient-gold">
              {formatSatz(balance)}
            </p>
            <p className="text-xs text-dark-400">
              SATZ <span className="text-dark-500">({balanceUsd})</span>
            </p>
          </Link>
        </div>
        
        {/* Streak & Multiplier */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5">
              <Flame size={14} className="text-orange-500" />
              <span className="text-sm font-semibold text-orange-400">{currentStreak} day streak</span>
            </div>
            {streakMultiplier > 1 && (
              <div className="flex items-center gap-1 bg-mint-500/10 border border-mint-500/20 rounded-full px-2 py-1">
                <Zap size={12} className="text-mint-400" />
                <span className="text-xs font-semibold text-mint-400">{streakMultiplier}x bonus</span>
              </div>
            )}
          </div>
        )}
        
        {/* Withdrawal Progress Bar */}
        <div className="bg-dark-800/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-dark-400">Progress to Withdrawal</span>
            <span className="text-xs font-medium text-white">
              {withdrawalProgress.percentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-1.5">
            <motion.div
              className={`h-full rounded-full ${
                withdrawalProgress.canWithdraw 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                  : 'bg-gradient-to-r from-mint-500 to-cyan-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${withdrawalProgress.percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-center text-dark-400">
            {withdrawalProgress.canWithdraw 
              ? <span className="text-green-400">🎉 Ready to withdraw BTC!</span>
              : formatToMilestone(balance)
            }
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* ============================================ */}
        {/* DAILY REWARD - Compact */}
        {/* ============================================ */}
        {dailyReward?.canClaim && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-gold-500/20 to-orange-500/20 border border-gold-500/30 rounded-xl p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center animate-pulse">
                  <Gift size={20} className="text-dark-900" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Daily Reward Ready!</p>
                  <p className="text-xs text-gold-400">
                    +{formatSatzWithUsd(dailyReward.streakReward, btcPrice)}
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClaimDaily}
                className="px-4 py-2 bg-gold-gradient rounded-xl font-semibold text-sm text-dark-900"
              >
                Claim
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* FIRST PREDICTION BONUS */}
        {/* ============================================ */}
        {isFirstPrediction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-mint-500/10 to-cyan-500/10 border border-mint-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-mint-500/20 rounded-xl flex items-center justify-center">
                <Sparkles size={24} className="text-mint-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">First Prediction Bonus!</p>
                <p className="text-xs text-dark-400">Make your first prediction to earn</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-mint-400 text-lg">+{FIRST_PREDICTION_BONUS}</p>
                <p className="text-xs text-dark-400">SATZ</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* FEATURED PREDICTION - Main CTA */}
        {/* ============================================ */}
        {featuredQuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target size={18} className="text-mint-400" />
                Today's Top Prediction
              </h2>
              <Link to="/predict" className="text-mint-400 text-xs flex items-center">
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-white/10">
              {/* Hot badge */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full z-10">
                <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                  <Zap size={10} /> HOT
                </span>
              </div>
              
              <div className="p-4">
                {/* Category & Time */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-mint-500/20 text-mint-400 rounded-full text-xs font-medium capitalize">
                    {featuredQuest.category || 'crypto'}
                  </span>
                  <span className="text-xs text-dark-400 flex items-center gap-1">
                    <Clock size={10} />
                    {formatTimeRemaining(featuredQuest.betting_deadline)}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-4 leading-tight pr-16">
                  {featuredQuest.title}
                </h3>
                
                {/* Options - Large tap targets */}
                {(() => {
                  const poolA = Number(featuredQuest.pool_a) || 0;
                  const poolB = Number(featuredQuest.pool_b) || 0;
                  const total = poolA + poolB;
                  const oddsA = total > 0 ? Math.round((poolA / total) * 100) : 50;
                  const oddsB = 100 - oddsA;
                  
                  return (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickPredict(featuredQuest.id, 'a')}
                        className="relative p-4 rounded-xl bg-mint-500/10 border-2 border-mint-500/30 hover:border-mint-500 active:bg-mint-500/20 transition-all"
                      >
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-mint-500 rounded text-xs font-bold text-dark-900">
                          {oddsA}%
                        </div>
                        <p className="text-white font-semibold text-sm mb-1 text-left">
                          {featuredQuest.option_a || 'Yes'}
                        </p>
                        <p className="text-xs text-dark-400 text-left">{formatSatz(poolA)} SATZ</p>
                      </motion.button>
                      
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickPredict(featuredQuest.id, 'b')}
                        className="relative p-4 rounded-xl bg-red-500/10 border-2 border-red-500/30 hover:border-red-500 active:bg-red-500/20 transition-all"
                      >
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-500 rounded text-xs font-bold text-white">
                          {oddsB}%
                        </div>
                        <p className="text-white font-semibold text-sm mb-1 text-left">
                          {featuredQuest.option_b || 'No'}
                        </p>
                        <p className="text-xs text-dark-400 text-left">{formatSatz(poolB)} SATZ</p>
                      </motion.button>
                    </div>
                  );
                })()}
                
                {/* Pool info */}
                <div className="flex items-center justify-between text-xs text-dark-400 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} className="text-gold-400" />
                    {formatSatz((Number(featuredQuest.pool_a) || 0) + (Number(featuredQuest.pool_b) || 0))} pool
                  </span>
                  <span>👥 {featuredQuest.participant_count || 0} players</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* QUICK ACTIONS */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2"
        >
          <Link to="/earn" className="flex flex-col items-center gap-1.5 p-3 bg-dark-800 rounded-xl hover:bg-dark-750 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Gift size={20} className="text-green-400" />
            </div>
            <span className="text-xs font-medium text-white">Earn</span>
          </Link>
          
          <Link to="/friends" className="flex flex-col items-center gap-1.5 p-3 bg-dark-800 rounded-xl hover:bg-dark-750 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users size={20} className="text-blue-400" />
            </div>
            <span className="text-xs font-medium text-white">Friends</span>
          </Link>
          
          <Link to="/leaderboard" className="flex flex-col items-center gap-1.5 p-3 bg-dark-800 rounded-xl hover:bg-dark-750 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Trophy size={20} className="text-yellow-400" />
            </div>
            <span className="text-xs font-medium text-white">Ranks</span>
          </Link>
        </motion.div>

        {/* ============================================ */}
        {/* LIVE ACTIVITY FEED - Social Proof */}
        {/* ============================================ */}
        {liveActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="overflow-hidden py-2"
          >
            <p className="text-xs text-dark-500 mb-2 px-1">Live Activity</p>
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-3"
                animate={{ x: [0, -500] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              >
                {[...liveActivity, ...liveActivity].map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-dark-800/50 rounded-full px-3 py-1.5 whitespace-nowrap"
                  >
                    <span className="text-sm">🏆</span>
                    <span className="text-xs text-dark-300">
                      <span className="text-white font-medium">{activity.name}</span>
                      {' won '}
                      <span className="text-gold-400 font-semibold">+{formatSatz(activity.amount)}</span>
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* STATS GRID */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-2"
        >
          <div className="bg-dark-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{user?.predictions_won || 0}</p>
            <p className="text-2xs text-dark-400">Wins</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{(user?.win_rate || 0).toFixed(0)}%</p>
            <p className="text-2xs text-dark-400">Win Rate</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{formatCompact(user?.total_won || 0)}</p>
            <p className="text-2xs text-dark-400">SATZ Won</p>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* REFERRAL BANNER - FIXED: Tiered rates 3-7% */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/friends">
            <div className="bg-gradient-to-r from-mint-500/20 to-cyan-500/20 border border-mint-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white mb-0.5">Invite & Earn Up to 7%</h3>
                  <p className="text-xs text-dark-300">
                    Friends get 250 SATZ + you earn tiered commission forever
                  </p>
                </div>
                <div className="w-10 h-10 bg-mint-500/20 rounded-full flex items-center justify-center">
                  <ArrowRight size={18} className="text-mint-400" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ============================================ */}
        {/* VAULT TRUST SIGNAL */}
        {/* ============================================ */}
        {liveStats?.vault && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-3"
          >
            <p className="text-xs text-dark-500">
              🔒 BTC Vault: <span className="text-dark-400 font-medium">{liveStats.vault.balance} BTC</span>
              {' '}• Backing 100% of SATZ
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
