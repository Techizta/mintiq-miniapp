/**
 * MintIQ LeaderboardPage (Ranks) - FIXED
 * 
 * Key Fixes:
 * - Correct API endpoint matching backend
 * - Proper time period filtering
 * - Renamed to "Ranks" for consistency
 * - Fixed data display for all categories
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown,
  TrendingUp,
  Users,
  Target,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, formatCompact } from '../utils/helpers';

// ============================================
// CONSTANTS
// ============================================

const LEADERBOARD_TYPES = [
  { id: 'earnings', label: 'Earnings', icon: TrendingUp, color: 'gold', apiType: 'earnings' },
  { id: 'wins', label: 'Wins', icon: Target, color: 'mint', apiType: 'wins' },
  { id: 'referrals', label: 'Referrals', icon: Users, color: 'blue', apiType: 'referrals' },
];

const TIME_FILTERS = [
  { id: 'daily', label: 'Today', apiPeriod: 'daily' },
  { id: 'weekly', label: 'This Week', apiPeriod: 'weekly' },
  { id: 'monthly', label: 'This Month', apiPeriod: 'monthly' },
  { id: 'all', label: 'All Time', apiPeriod: 'all' },
];

export default function LeaderboardPage() {
  const { user } = useUserStore();
  
  // State
  const [activeType, setActiveType] = useState('earnings');
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchLeaderboard();
  }, [activeType, timeFilter]);
  
  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Use the correct endpoint format that matches backend
      const typeConfig = LEADERBOARD_TYPES.find(t => t.id === activeType);
      const timeConfig = TIME_FILTERS.find(t => t.id === timeFilter);
      
      const response = await api.get(`/api/miniapp/leaderboard/${typeConfig?.apiType || 'earnings'}`, {
        period: timeConfig?.apiPeriod || 'all'
      });
      
      const data = response.leaderboard || response.users || [];
      setLeaderboard(data);
      
      // Set user rank from response
      if (response.userRank) {
        // Find user's data in the leaderboard or calculate
        const userEntry = data.find(e => e.id === user?.id || e.telegram_id === user?.telegram_id);
        setUserRank({
          rank: response.userRank,
          ...userEntry,
          total_earned: userEntry?.total_earned || user?.total_earned || 0,
          predictions_won: userEntry?.predictions_won || user?.predictions_won || 0,
          referral_count: userEntry?.referral_count || user?.referral_count || 0,
        });
      } else {
        setUserRank(null);
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      setLeaderboard([]);
      setUserRank(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleTypeChange = (type) => {
    telegram.hapticSelection();
    setActiveType(type);
  };
  
  const handleTimeChange = (time) => {
    telegram.hapticSelection();
    setTimeFilter(time);
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getRankDisplay = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  
  const getValueDisplay = (entry) => {
    if (!entry) return 0;
    switch (activeType) {
      case 'earnings':
        return formatSatz(entry.total_earned || entry.earnings || entry.score || 0);
      case 'wins':
        return entry.predictions_won || entry.wins || entry.score || 0;
      case 'referrals':
        return entry.referral_count || entry.referrals || entry.score || 0;
      default:
        return entry.score || 0;
    }
  };
  
  const getValueLabel = () => {
    switch (activeType) {
      case 'earnings': return 'SATZ';
      case 'wins': return 'wins';
      case 'referrals': return 'friends';
      default: return '';
    }
  };

  const activeTypeConfig = LEADERBOARD_TYPES.find(t => t.id === activeType);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-dark-800 to-dark-950 px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={24} className="text-gold-400" />
          <h1 className="text-xl font-bold text-white">Ranks</h1>
        </div>
        
        {/* Type Tabs */}
        <div className="flex bg-dark-800 rounded-xl p-1 mb-4">
          {LEADERBOARD_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeChange(type.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeType === type.id
                  ? `bg-${type.color}-500 text-white`
                  : 'text-dark-400 hover:text-dark-300'
              }`}
              style={{
                backgroundColor: activeType === type.id 
                  ? type.color === 'gold' ? '#F59E0B' 
                  : type.color === 'mint' ? '#10B981' 
                  : '#3B82F6'
                  : 'transparent'
              }}
            >
              <type.icon size={14} />
              {type.label}
            </button>
          ))}
        </div>
        
        {/* Time Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleTimeChange(filter.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                timeFilter === filter.id
                  ? 'bg-white text-dark-900'
                  : 'bg-dark-800 text-dark-400'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* User's Rank Card */}
      {userRank && userRank.rank > 0 && (
        <div className="px-4 -mt-2 mb-4">
          <div className="bg-gradient-to-r from-mint-500/10 to-cyan-500/10 border border-mint-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-mint-500/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-mint-400">#{userRank.rank}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Your Rank</p>
                <p className="text-sm text-dark-400">
                  {getValueDisplay(userRank)} {getValueLabel()}
                </p>
              </div>
              {userRank.rank <= 10 && (
                <div className="bg-mint-500/20 px-3 py-1 rounded-full">
                  <span className="text-xs font-bold text-mint-400">Top 10!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="px-4 space-y-2">
        {isLoading ? (
          // Loading skeletons
          [...Array(10)].map((_, i) => (
            <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-dark-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-dark-700 rounded w-24 mb-1" />
                  <div className="h-3 bg-dark-700 rounded w-16" />
                </div>
                <div className="h-5 bg-dark-700 rounded w-16" />
              </div>
            </div>
          ))
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={48} className="mx-auto mb-4 text-dark-600" />
            <p className="text-dark-400 font-medium">No data yet</p>
            <p className="text-sm text-dark-500 mt-1">Be the first on the leaderboard!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="flex items-end justify-center gap-2 mb-6 pt-4">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 text-center"
                >
                  <div className="w-14 h-14 mx-auto bg-gray-400/20 rounded-full flex items-center justify-center mb-2 border-2 border-gray-400">
                    <span className="text-lg font-bold text-gray-300">
                      {leaderboard[1]?.first_name?.[0] || '2'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate px-1">
                    {leaderboard[1]?.first_name || leaderboard[1]?.username || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-400">{getValueDisplay(leaderboard[1])}</p>
                  <div className="mt-2 bg-gray-400/20 rounded-t-lg h-16 flex items-center justify-center">
                    <span className="text-2xl">🥈</span>
                  </div>
                </motion.div>
                
                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 text-center"
                >
                  <div className="w-16 h-16 mx-auto bg-gold-500/20 rounded-full flex items-center justify-center mb-2 border-2 border-gold-500 ring-4 ring-gold-500/20">
                    <span className="text-xl font-bold text-gold-400">
                      {leaderboard[0]?.first_name?.[0] || '1'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white truncate px-1">
                    {leaderboard[0]?.first_name || leaderboard[0]?.username || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gold-400 font-medium">{getValueDisplay(leaderboard[0])}</p>
                  <div className="mt-2 bg-gold-500/20 rounded-t-lg h-24 flex items-center justify-center">
                    <span className="text-3xl">🥇</span>
                  </div>
                </motion.div>
                
                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 text-center"
                >
                  <div className="w-14 h-14 mx-auto bg-orange-600/20 rounded-full flex items-center justify-center mb-2 border-2 border-orange-600">
                    <span className="text-lg font-bold text-orange-400">
                      {leaderboard[2]?.first_name?.[0] || '3'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate px-1">
                    {leaderboard[2]?.first_name || leaderboard[2]?.username || 'Anonymous'}
                  </p>
                  <p className="text-xs text-orange-400">{getValueDisplay(leaderboard[2])}</p>
                  <div className="mt-2 bg-orange-600/20 rounded-t-lg h-12 flex items-center justify-center">
                    <span className="text-2xl">🥉</span>
                  </div>
                </motion.div>
              </div>
            )}
            
            {/* Rest of leaderboard */}
            {leaderboard.slice(3).map((entry, index) => {
              const rank = index + 4;
              const isCurrentUser = entry.id === user?.id || entry.telegram_id === user?.telegram_id;
              
              return (
                <motion.div
                  key={entry.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`bg-dark-800 rounded-xl p-3 flex items-center gap-3 border ${
                    isCurrentUser ? 'border-mint-500/50 bg-mint-500/5' : 'border-white/5'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isCurrentUser ? 'bg-mint-500/20 text-mint-400' : 'bg-dark-700 text-dark-400'
                  }`}>
                    #{rank}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isCurrentUser ? 'text-mint-400' : 'text-white'}`}>
                      {entry.first_name || entry.username || 'Anonymous'}
                      {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                    </p>
                    {entry.status_tier && (
                      <p className="text-xs text-dark-500 capitalize">{entry.status_tier}</p>
                    )}
                  </div>
                  
                  {/* Value */}
                  <div className="text-right">
                    <p className={`font-bold ${
                      activeType === 'earnings' ? 'text-gold-400' :
                      activeType === 'wins' ? 'text-mint-400' :
                      'text-blue-400'
                    }`}>
                      {getValueDisplay(entry)}
                    </p>
                    <p className="text-xs text-dark-500">{getValueLabel()}</p>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* Competition Info */}
      <div className="px-4 mt-6">
        <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
          <h3 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
            <Star size={14} className="text-gold-400" />
            Climb the Ranks
          </h3>
          <p className="text-xs text-dark-400">
            {activeType === 'earnings' && 'Win predictions and complete tasks to earn more SATZ and climb the leaderboard.'}
            {activeType === 'wins' && 'Make accurate predictions to increase your win count and show off your skills.'}
            {activeType === 'referrals' && 'Invite more friends to join MintIQ and earn lifetime commissions.'}
          </p>
        </div>
      </div>
    </div>
  );
}
