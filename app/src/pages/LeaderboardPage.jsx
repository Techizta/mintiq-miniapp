import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp, Crown, Flame, Award } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, getTierInfo } from '../utils/helpers';

export default function LeaderboardPage() {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState('earnings');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => { fetchLeaderboard(); }, [activeTab]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/miniapp/leaderboard/${activeTab}`);
      setLeaderboard(response.leaderboard || []);
      setUserRank(response.userRank || 0);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'wins', label: 'Wins', icon: Trophy },
    { id: 'streak', label: 'Streak', icon: Flame },
    { id: 'winrate', label: 'Win %', icon: Award },
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (rank === 2) return { icon: Medal, color: 'text-gray-300', bg: 'bg-gray-500/20' };
    if (rank === 3) return { icon: Medal, color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { icon: null, color: 'text-dark-400', bg: 'bg-dark-700' };
  };

  const getScoreLabel = () => {
    switch (activeTab) {
      case 'earnings': return 'Earned';
      case 'wins': return 'Wins';
      case 'streak': return 'Streak';
      case 'winrate': return 'Win %';
      default: return 'Score';
    }
  };

  const formatScore = (entry) => {
    switch (activeTab) {
      case 'earnings': return formatSatz(entry.total_earned || entry.score || 0);
      case 'wins': return entry.predictions_won || entry.score || 0;
      case 'streak': return `${entry.best_streak || entry.score || 0}d`;
      case 'winrate': return `${parseFloat(entry.win_rate || entry.score || 0).toFixed(1)}%`;
      default: return entry.score || 0;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Trophy className="text-gold-400" size={24} />
          Leaderboard
        </h1>
        <div className="flex bg-dark-800 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { telegram.hapticSelection(); setActiveTab(tab.id); }}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${activeTab === tab.id ? 'bg-gold-500 text-dark-900' : 'text-dark-400'}`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {userRank > 0 && (
        <div className="px-4 py-3">
          <div className="bg-gradient-to-r from-gold-500/20 to-orange-500/20 border border-gold-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gold-400">Your Rank</p><p className="text-2xl font-bold text-white">#{userRank}</p></div>
              <div className="text-right"><p className="text-sm text-dark-400">{getScoreLabel()}</p><p className="text-lg font-bold text-gold-400">{formatScore(user || {})}</p></div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 space-y-2">
        {isLoading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-dark-700 rounded-full" />
              <div className="w-10 h-10 bg-dark-700 rounded-full" />
              <div className="flex-1"><div className="h-4 bg-dark-700 rounded w-1/3 mb-2" /><div className="h-3 bg-dark-700 rounded w-1/4" /></div>
              <div className="h-5 bg-dark-700 rounded w-16" />
            </div>
          ))
        ) : error ? (
          <div className="text-center py-12">
            <Trophy size={48} className="mx-auto mb-4 text-dark-600" />
            <p className="text-dark-400 font-medium">{error}</p>
            <button onClick={fetchLeaderboard} className="mt-4 px-6 py-2 bg-gold-500 text-dark-900 rounded-xl font-medium">Retry</button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={48} className="mx-auto mb-4 text-dark-600" />
            <p className="text-dark-400 font-medium">No data yet</p>
            <p className="text-sm text-dark-500 mt-1">Start predicting to join!</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => {
            const rank = index + 1;
            const badge = getRankBadge(rank);
            const tierInfo = getTierInfo(entry.tier);
            const isCurrentUser = entry.id === user?.id;
            return (
              <motion.div key={entry.id || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
                className={`rounded-xl p-3 flex items-center gap-3 ${isCurrentUser ? 'bg-mint-500/10 border border-mint-500/30' : 'bg-dark-800 border border-white/5'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${badge.bg} ${badge.color}`}>
                  {badge.icon ? <badge.icon size={16} /> : rank}
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: tierInfo.color + '33', color: tierInfo.color }}>
                  {entry.first_name?.[0] || entry.username?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isCurrentUser ? 'text-mint-400' : 'text-white'}`}>{isCurrentUser ? 'You' : entry.first_name || entry.username || 'Anon'}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tierInfo.color + '33', color: tierInfo.color }}>{tierInfo.name}</span>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${rank <= 3 ? 'text-gold-400' : 'text-white'}`}>{formatScore(entry)}</p>
                  <p className="text-xs text-dark-500">{getScoreLabel()}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
