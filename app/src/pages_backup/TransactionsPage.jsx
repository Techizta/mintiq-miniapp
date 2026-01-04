import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Gift, Zap, Trophy, Users, Calendar, Target, Coins } from 'lucide-react';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, formatRelativeTime } from '../utils/helpers';

const getTransactionIcon = (type) => {
  const icons = {
    welcome_bonus: Gift,
    daily_login: Calendar,
    spin_reward: Zap,
    ad_reward: Gift,
    prediction_bet: Target,
    prediction_win: Trophy,
    referral_bonus: Users,
    referral_commission: Users,
    challenge_stake: Zap,
    challenge_win: Trophy,
    friend_challenge_win: Trophy,
    friend_challenge_stake: Zap,
    task_reward: Gift,
    community_bonus: Users,
  };
  return icons[type] || Coins;
};

const getTransactionColor = (amount) => {
  return amount > 0 ? 'text-green-400' : 'text-red-400';
};

const getTransactionBg = (amount) => {
  return amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20';
};

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [activeFilter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/miniapp/user/transactions?limit=100&type=${activeFilter}`);
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    telegram.hapticImpact('light');
    await fetchTransactions();
    setIsRefreshing(false);
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'earned', label: 'Earned' },
    { id: 'spent', label: 'Spent' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-dark-400 hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-white">Transactions</h1>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="p-2 text-dark-400 hover:text-white"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-900 px-4 py-3 border-b border-white/5">
        <div className="flex bg-dark-800 rounded-xl p-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                telegram.hapticSelection();
                setActiveFilter(filter.id);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-mint-500 text-white'
                  : 'text-dark-400'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-dark-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-dark-700 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-dark-700 rounded w-1/3" />
                </div>
                <div className="h-5 bg-dark-700 rounded w-16" />
              </div>
            </div>
          ))
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <Coins size={48} className="mx-auto mb-4 text-dark-600" />
            <p className="text-dark-400 font-medium">No transactions</p>
            <p className="text-sm text-dark-500 mt-1">
              {activeFilter === 'earned' ? 'No earnings yet' : 
               activeFilter === 'spent' ? 'No spending yet' : 
               'Your transaction history will appear here'}
            </p>
          </div>
        ) : (
          transactions.map((tx, index) => {
            const Icon = getTransactionIcon(tx.type);
            const isPositive = tx.amount > 0;
            
            return (
              <motion.div
                key={tx.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-dark-800 rounded-xl p-4 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionBg(tx.amount)}`}>
                    <Icon size={20} className={getTransactionColor(tx.amount)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white capitalize">
                      {tx.type?.replace(/_/g, ' ') || 'Transaction'}
                    </p>
                    <p className="text-xs text-dark-400 truncate">
                      {tx.description || formatRelativeTime(tx.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(tx.amount)}`}>
                      {isPositive ? '+' : ''}{formatSatz(tx.amount)}
                    </p>
                    <p className="text-xs text-dark-500">{formatRelativeTime(tx.created_at)}</p>
                  </div>
                </div>
                {tx.balance_after !== undefined && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex justify-between text-xs">
                    <span className="text-dark-500">Balance after</span>
                    <span className="text-dark-400">{formatSatz(tx.balance_after)} SATZ</span>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
