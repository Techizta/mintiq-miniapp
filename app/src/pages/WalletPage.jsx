/**
 * MintIQ WalletPage - SIMPLIFIED VERSION
 * 
 * Features:
 * - Balance display (SATZ only, no BTC)
 * - Stats cards
 * - Transaction history with tabs (All, Earned, Spent)
 * - Pagination with load more
 * - NO withdrawal (token launch planned)
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, 
  Target, Percent, Clock, CheckCircle, XCircle, X,
  ChevronDown, RefreshCw, Coins, Trophy
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';

// ============================================
// TRANSACTION ITEM
// ============================================

function TransactionItem({ tx }) {
  const getIcon = () => {
    switch (tx.type) {
      case 'prediction_win':
      case 'pool_win':
      case 'quest_win':
        return <TrendingUp size={16} className="text-green-400" />;
      case 'prediction_bet':
      case 'pool_bet':
        return <Target size={16} className="text-orange-400" />;
      case 'daily_login':
      case 'daily_reward':
        return <CheckCircle size={16} className="text-blue-400" />;
      case 'referral_commission':
      case 'referral_bonus':
        return <ArrowDownLeft size={16} className="text-purple-400" />;
      case 'tier_bonus':
        return <Trophy size={16} className="text-gold-400" />;
      case 'tap_mining':
        return <Coins size={16} className="text-orange-400" />;
      default:
        return tx.amount > 0 
          ? <ArrowDownLeft size={16} className="text-green-400" />
          : <ArrowUpRight size={16} className="text-red-400" />;
    }
  };

  const getLabel = () => {
    const labels = {
      'prediction_win': 'Prediction Won',
      'prediction_bet': 'Prediction Placed',
      'pool_win': 'Pool Won',
      'pool_bet': 'Pool Entry',
      'daily_login': 'Daily Reward',
      'daily_reward': 'Daily Reward',
      'referral_commission': 'Referral Commission',
      'referral_bonus': 'Referral Bonus',
      'tier_bonus': 'Tier Bonus',
      'tap_mining': 'Tap Mining',
      'ad_reward': 'Ad Reward',
      'quest_win': 'Quest Won',
      'welcome_bonus': 'Welcome Bonus',
      'streak_milestone': 'Streak Milestone',
      'pool_creator_fee': 'Creator Fee',
      'channel_bonus': 'Channel Bonus',
      'task_reward': 'Task Reward',
      'leaderboard_reward': 'Leaderboard Reward',
    };
    return labels[tx.type] || tx.description || tx.type;
  };

  const amount = Number(tx.amount) || 0;
  const isPositive = amount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
    >
      <div className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{getLabel()}</p>
        <p className="text-xs text-dark-500">
          {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <p className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{formatSatz(amount)}
      </p>
    </motion.div>
  );
}

// ============================================
// MAIN WALLET PAGE
// ============================================

export default function WalletPage() {
  const navigate = useNavigate();
  const { user, fetchUser } = useUserStore();
  const { showToast } = useUIStore();
  
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, earned, spent
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const ITEMS_PER_PAGE = 20;
  
  const balance = Number(user?.satz_balance) || 0;
  const totalEarned = Number(user?.total_earned) || 0;
  const totalSpent = Number(user?.total_spent) || 0;
  const totalWon = Number(user?.total_won) || 0;
  const predictionsWon = Number(user?.predictions_won) || 0;
  const predictionsMade = Number(user?.predictions_made) || 0;
  const winRate = predictionsMade > 0 ? Math.round((predictionsWon / predictionsMade) * 100) : 0;

  // Load transactions
  const loadTransactions = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    
    try {
      const response = await api.get('/api/miniapp/user/transactions', {
        params: {
          page: pageNum,
          limit: ITEMS_PER_PAGE,
          type: activeTab === 'all' ? undefined : activeTab
        }
      });
      
      const newTxs = response?.transactions || [];
      
      if (append) {
        setTransactions(prev => [...prev, ...newTxs]);
      } else {
        setTransactions(newTxs);
      }
      
      setHasMore(newTxs.length === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (e) {
      console.error('Failed to load transactions:', e);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchUser();
    loadTransactions(1, false);
  }, [activeTab]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadTransactions(page + 1, true);
    }
  };

  // Filter transactions by tab
  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'earned') return Number(tx.amount) > 0;
    if (activeTab === 'spent') return Number(tx.amount) < 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-dark-400">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Wallet size={20} className="text-orange-400" />
          Wallet
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-500/20 rounded-2xl p-5"
        >
          <p className="text-dark-400 text-sm mb-1">Your Balance</p>
          <p className="text-4xl font-bold text-white mb-1">
            {formatSatz(balance)} <span className="text-lg text-dark-400">SATZ</span>
          </p>
          <p className="text-xs text-dark-500">
            🚀 Token launch coming soon!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-dark-400 mb-2">
              <TrendingUp size={16} />
              <span className="text-xs">Total Earned</span>
            </div>
            <p className="text-xl font-bold text-green-400">+{formatSatz(totalEarned)}</p>
          </div>
          
          <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-dark-400 mb-2">
              <Target size={16} />
              <span className="text-xs">Total Spent</span>
            </div>
            <p className="text-xl font-bold text-red-400">-{formatSatz(totalSpent)}</p>
          </div>

          <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-dark-400 mb-2">
              <CheckCircle size={16} />
              <span className="text-xs">Predictions Won</span>
            </div>
            <p className="text-xl font-bold text-white">{predictionsWon}</p>
            <p className="text-xs text-dark-500">of {predictionsMade} made</p>
          </div>

          <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-dark-400 mb-2">
              <Percent size={16} />
              <span className="text-xs">Win Rate</span>
            </div>
            <p className="text-xl font-bold text-white">{winRate}%</p>
            <p className="text-xs text-dark-500">{formatSatz(totalWon)} won</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-dark-800/50 rounded-xl border border-white/5 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {[
              { id: 'all', label: 'All' },
              { id: 'earned', label: 'Earned' },
              { id: 'spent', label: 'Spent' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { telegram.hapticSelection(); setActiveTab(tab.id); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-400 border-b-2 border-orange-400'
                    : 'text-dark-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transaction List */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white text-sm">Transaction History</h3>
              <button 
                onClick={() => loadTransactions(1, false)}
                className="text-dark-400 p-1"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-center gap-3 py-3">
                    <div className="w-10 h-10 bg-dark-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-dark-700 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-dark-700 rounded w-1/3" />
                    </div>
                    <div className="h-4 bg-dark-700 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock size={24} className="text-dark-500" />
                </div>
                <p className="text-dark-400 text-sm">No transactions yet</p>
                <p className="text-dark-500 text-xs mt-1">
                  {activeTab === 'earned' ? 'Start earning SATZ!' : 
                   activeTab === 'spent' ? 'Make predictions to see spending' :
                   'Your activity will appear here'}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-white/5">
                  {filteredTransactions.map((tx, i) => (
                    <TransactionItem key={tx.id || i} tx={tx} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full mt-4 py-3 bg-dark-700 rounded-xl text-dark-400 text-sm flex items-center justify-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-dark-500 border-t-white rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Load More
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
