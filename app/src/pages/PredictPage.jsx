/**
 * MintIQ PredictPage - FIXED
 * 
 * Key Fixes:
 * - Category filters work correctly
 * - Search functionality works
 * - Proper status detection for ended quests (shows "Pending Result" vs "Ended")
 * - Fetches category from API when category changes
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Clock, 
  Users, 
  TrendingUp, 
  Flame, 
  Filter,
  Zap,
  ChevronRight,
  Trophy,
  X,
  CheckCircle
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { 
  formatSatz, 
  formatTimeRemaining, 
  calculateOdds, 
  satzUsdValue,
  formatSatzWithUsd,
  getCategoryEmoji 
} from '../utils/helpers';

// ============================================
// CONSTANTS
// ============================================

const TABS = [
  { id: 'active', label: 'Active', icon: Flame },
  { id: 'mybets', label: 'My Bets', icon: Trophy },
  { id: 'resolved', label: 'History', icon: Clock },
];

const CATEGORIES = [
  { id: 'all', name: 'All', emoji: '🔥' },
  { id: 'crypto', name: 'Crypto', emoji: '🪙' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'politics', name: 'Politics', emoji: '🏛️' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { id: 'finance', name: 'Finance', emoji: '📈' },
  { id: 'tech', name: 'Tech', emoji: '💻' },
];

export default function PredictPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserStore();
  
  // State
  const [activeTab, setActiveTab] = useState('active');
  const [quests, setQuests] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [todaysPick, setTodaysPick] = useState(null);

  // ============================================
  // DATA FETCHING - FIXED: Refetch when category changes
  // ============================================

  const fetchQuests = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = activeTab === 'resolved' ? 'resolved' : 'active';
      // FIXED: Include category in API call
      const params = new URLSearchParams({
        status,
        limit: '50',
      });
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await api.get(`/api/miniapp/quests?${params.toString()}`);
      const questList = response.quests || [];
      setQuests(questList);
      
      // Set today's pick (highest pool active quest)
      if (activeTab === 'active' && questList.length > 0) {
        const sorted = [...questList].sort((a, b) => {
          const poolA = (Number(a.pool_a) || 0) + (Number(a.pool_b) || 0);
          const poolB = (Number(b.pool_a) || 0) + (Number(b.pool_b) || 0);
          return poolB - poolA;
        });
        setTodaysPick(sorted[0]);
      } else {
        setTodaysPick(null);
      }
    } catch (error) {
      console.error('Failed to fetch quests:', error);
      setQuests([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedCategory]);

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/miniapp/predictions');
      setPredictions(response.predictions || []);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'mybets') {
      fetchPredictions();
    } else {
      fetchQuests();
    }
  }, [activeTab, selectedCategory, fetchQuests, fetchPredictions]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleQuestClick = (questId) => {
    telegram.hapticSelection();
    navigate(`/predict/${questId}`);
  };

  const handleTabChange = (tabId) => {
    telegram.hapticSelection();
    setActiveTab(tabId);
  };

  const handleCategoryChange = (categoryId) => {
    telegram.hapticSelection();
    setSelectedCategory(categoryId);
  };

  // ============================================
  // FILTERED DATA - FIXED: Also filter by search locally
  // ============================================

  const filteredQuests = useMemo(() => {
    return quests.filter(q => {
      // Exclude today's pick from main list
      if (todaysPick && q.id === todaysPick.id && activeTab === 'active') return false;
      
      // FIXED: Search filter on title
      const matchesSearch = !searchQuery || 
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [quests, searchQuery, todaysPick, activeTab]);

  // FIXED: Proper status detection
  const getQuestStatus = (quest) => {
    const now = new Date();
    const deadline = new Date(quest.betting_deadline);
    const isDeadlinePassed = deadline <= now;
    
    if (quest.status === 'resolved' || quest.winning_option) {
      return { status: 'resolved', label: 'Resolved', color: 'text-mint-400', bg: 'bg-mint-500/20' };
    }
    if (quest.status === 'cancelled') {
      return { status: 'cancelled', label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/20' };
    }
    if (isDeadlinePassed) {
      return { status: 'pending', label: 'Pending Result', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    }
    return { status: 'active', label: 'Active', color: 'text-mint-400', bg: 'bg-mint-500/20' };
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4 sticky top-0 z-20">
        <h1 className="text-xl font-bold text-white mb-4">Predictions</h1>
        
        {/* Tabs */}
        <div className="flex bg-dark-800 rounded-xl p-1 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-mint-500 text-white'
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filter - only for active/resolved */}
        {activeTab !== 'mybets' && (
          <>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search predictions..."
                className="w-full bg-dark-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-mint-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Category Pills - FIXED: Proper click handling */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-mint-500 text-white'
                      : 'bg-dark-800 text-dark-400 hover:text-white'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {activeTab === 'mybets' ? (
          // ============================================
          // MY BETS VIEW
          // ============================================
          isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-dark-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-dark-700 rounded w-1/2" />
              </div>
            ))
          ) : predictions.length === 0 ? (
            <div className="text-center py-12">
              <Trophy size={48} className="mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400 font-medium">No predictions yet</p>
              <p className="text-sm text-dark-500 mt-1">Make your first prediction!</p>
              <button
                onClick={() => setActiveTab('active')}
                className="mt-4 px-6 py-2 bg-mint-500 text-white rounded-xl font-medium"
              >
                Browse Predictions
              </button>
            </div>
          ) : (
            predictions.map((pred, index) => {
              // FIXED: Proper status detection for predictions
              const questStatus = getQuestStatus(pred);
              const isWinner = pred.is_winner === true;
              const isLoser = pred.is_winner === false && questStatus.status === 'resolved';
              const isPending = questStatus.status === 'pending';
              const isActive = questStatus.status === 'active';
              
              return (
                <motion.div
                  key={pred.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleQuestClick(pred.quest_id)}
                  className="bg-dark-800 rounded-xl p-4 border border-white/5 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-dark-400 flex items-center gap-1">
                      <span>{getCategoryEmoji(pred.category)}</span>
                      {pred.category || 'General'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${questStatus.bg} ${questStatus.color}`}>
                      {isWinner ? '🏆 Won!' : isLoser ? 'Lost' : questStatus.label}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-white mb-3 line-clamp-2">{pred.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-dark-400">Your pick: </span>
                      <span className={`font-medium ${
                        pred.chosen_option === 'a' ? 'text-mint-400' : 'text-red-400'
                      }`}>
                        {pred.chosen_option === 'a' ? pred.option_a : pred.option_b}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-dark-400">Bet: </span>
                      <span className="text-gold-400 font-medium">{formatSatz(pred.amount)}</span>
                    </div>
                  </div>
                  
                  {isWinner && pred.payout > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-sm text-dark-400">Winnings</span>
                      <span className="text-green-400 font-bold">+{formatSatzWithUsd(pred.payout)}</span>
                    </div>
                  )}
                </motion.div>
              );
            })
          )
        ) : (
          // ============================================
          // ACTIVE/RESOLVED QUESTS VIEW
          // ============================================
          <>
            {/* Today's Pick - Featured */}
            {activeTab === 'active' && todaysPick && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-gold-400" />
                  <span className="text-xs font-semibold text-gold-400 uppercase tracking-wide">Today's Pick</span>
                </div>
                
                <div 
                  onClick={() => handleQuestClick(todaysPick.id)}
                  className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-4 border border-gold-500/20 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-0.5 bg-mint-500/20 text-mint-400 rounded-full text-xs font-medium capitalize flex items-center gap-1">
                      <span>{getCategoryEmoji(todaysPick.category)}</span>
                      {todaysPick.category || 'crypto'}
                    </span>
                    <span className="text-xs text-dark-400 flex items-center gap-1">
                      <Clock size={10} />
                      {formatTimeRemaining(todaysPick.betting_deadline)}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-white text-lg mb-4">{todaysPick.title}</h3>
                  
                  {(() => {
                    const poolA = Number(todaysPick.pool_a) || 0;
                    const poolB = Number(todaysPick.pool_b) || 0;
                    const total = poolA + poolB;
                    const oddsA = total > 0 ? Math.round((poolA / total) * 100) : 50;
                    const oddsB = 100 - oddsA;
                    
                    return (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-mint-500/10 border border-mint-500/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium text-sm truncate">{todaysPick.option_a}</span>
                            <span className="text-mint-400 font-bold">{oddsA}%</span>
                          </div>
                          <p className="text-xs text-dark-400">{formatSatz(poolA)} SATZ</p>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium text-sm truncate">{todaysPick.option_b}</span>
                            <span className="text-red-400 font-bold">{oddsB}%</span>
                          </div>
                          <p className="text-xs text-dark-400">{formatSatz(poolB)} SATZ</p>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="flex items-center justify-between text-xs text-dark-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-gold-400" />
                      {formatSatz((Number(todaysPick.pool_a) || 0) + (Number(todaysPick.pool_b) || 0))} pool
                    </span>
                    <span>👥 {todaysPick.participant_count || 0} players</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Loading State */}
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-dark-700 rounded w-1/4 mb-3" />
                  <div className="h-5 bg-dark-700 rounded w-3/4 mb-3" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-16 bg-dark-700 rounded-lg" />
                    <div className="flex-1 h-16 bg-dark-700 rounded-lg" />
                  </div>
                </div>
              ))
            ) : filteredQuests.length === 0 ? (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto mb-4 text-dark-600" />
                <p className="text-dark-400 font-medium">No predictions found</p>
                <p className="text-sm text-dark-500 mt-1">
                  {searchQuery ? 'Try a different search' : 'Check back soon!'}
                </p>
              </div>
            ) : (
              /* Quest List */
              filteredQuests.map((quest, index) => {
                const poolA = Number(quest.pool_a) || 0;
                const poolB = Number(quest.pool_b) || 0;
                const total = poolA + poolB;
                const oddsA = total > 0 ? Math.round((poolA / total) * 100) : 50;
                const oddsB = 100 - oddsA;
                const questStatus = getQuestStatus(quest);
                const isHot = (quest.participant_count || 0) > 5 || total > 1000;

                return (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleQuestClick(quest.id)}
                    className="bg-dark-800 rounded-xl p-4 border border-white/5 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-dark-700 text-dark-300 rounded-full text-xs capitalize flex items-center gap-1">
                          {getCategoryEmoji(quest.category)} {quest.category || 'crypto'}
                        </span>
                        {isHot && questStatus.status === 'active' && (
                          <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center gap-0.5">
                            <Flame size={10} /> Hot
                          </span>
                        )}
                      </div>
                      {/* FIXED: Show proper status */}
                      <span className={`text-xs flex items-center gap-1 ${questStatus.color}`}>
                        {questStatus.status === 'resolved' && <CheckCircle size={10} />}
                        {questStatus.status === 'active' && <Clock size={10} />}
                        {questStatus.status === 'active' 
                          ? formatTimeRemaining(quest.betting_deadline)
                          : questStatus.label
                        }
                      </span>
                    </div>

                    <h3 className="font-medium text-white mb-3 line-clamp-2">{quest.title}</h3>

                    {/* Compact odds display */}
                    <div className="flex gap-2 mb-3">
                      <div className={`flex-1 p-2.5 rounded-lg ${questStatus.status !== 'active' ? 'bg-dark-700' : 'bg-mint-500/10 border border-mint-500/20'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white font-medium truncate pr-2">{quest.option_a || 'Yes'}</span>
                          <span className={`font-bold ${questStatus.status !== 'active' ? 'text-dark-400' : 'text-mint-400'}`}>{oddsA}%</span>
                        </div>
                      </div>
                      <div className={`flex-1 p-2.5 rounded-lg ${questStatus.status !== 'active' ? 'bg-dark-700' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white font-medium truncate pr-2">{quest.option_b || 'No'}</span>
                          <span className={`font-bold ${questStatus.status !== 'active' ? 'text-dark-400' : 'text-red-400'}`}>{oddsB}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-dark-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={12} /> {formatSatz(total)} SATZ
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {quest.participant_count || 0}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
