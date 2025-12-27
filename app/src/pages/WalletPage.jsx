/**
 * MintIQ WalletPage - REDESIGNED
 * 
 * Key Changes:
 * - USD value prominently displayed
 * - Withdrawal progress always visible
 * - Clear breakdown of earnings
 * - Quick actions for redeem
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  ChevronRight,
  Zap,
  TrendingUp,
  Gift,
  Trophy,
  Users,
  Lock,
  Unlock,
  Info,
  Copy,
  Check
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { 
  formatSatz, 
  formatCompact,
  satzUsdValue,
  formatSatzWithUsd,
  getWithdrawalProgress,
  formatToMilestone,
  getTierInfo,
  formatRelativeTime,
  copyToClipboard,
  setBtcPrice
} from '../utils/helpers';

// ============================================
// CONSTANTS
// ============================================

const WITHDRAWAL_MINIMUM = 50000;

export default function WalletPage() {
  const navigate = useNavigate();
  const { user, fetchUser } = useUserStore();
  const { showToast } = useUIStore();
  
  // State
  const [transactions, setTransactions] = useState([]);
  const [btcPrice, setBtcPriceState] = useState(100000);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUser(true),
        fetchTransactions(),
        fetchBtcPrice(),
      ]);
    } catch (e) {
      console.error('Wallet load error:', e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/miniapp/user/transactions', { limit: 10 });
      setTransactions(response.transactions || []);
    } catch (e) {
      console.error('Transactions fetch error:', e);
    }
  };
  
  const fetchBtcPrice = async () => {
    try {
      const response = await api.get('/api/miniapp/public/stats');
      if (response?.btcPrice) {
        setBtcPrice(response.btcPrice);
        setBtcPriceState(response.btcPrice);
      }
    } catch (e) {
      console.error('BTC price fetch error:', e);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleCopyReferral = async () => {
    if (user?.referral_code) {
      await copyToClipboard(`https://t.me/MintIQBot?start=${user.referral_code}`);
      setCopied(true);
      telegram.hapticNotification('success');
      showToast('Referral link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ============================================
  // COMPUTED
  // ============================================

  const balance = Number(user?.satz_balance) || 0;
  const balanceUsd = satzUsdValue(balance, btcPrice);
  const withdrawalProgress = getWithdrawalProgress(balance);
  const tierInfo = getTierInfo(user?.tier || user?.status_tier || 'newcomer');

  // Transaction type info
  const getTransactionInfo = (type) => {
    const types = {
      prediction_win: { icon: Trophy, color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Prediction Win' },
      prediction_bet: { icon: ArrowUpRight, color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'Prediction' },
      daily_login: { icon: Gift, color: 'text-gold-400', bgColor: 'bg-gold-500/20', label: 'Daily Reward' },
      daily_reward: { icon: Gift, color: 'text-gold-400', bgColor: 'bg-gold-500/20', label: 'Daily Reward' },
      referral: { icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Referral' },
      task_reward: { icon: Zap, color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Task' },
      spin_reward: { icon: Gift, color: 'text-pink-400', bgColor: 'bg-pink-500/20', label: 'Spin' },
      welcome_bonus: { icon: Gift, color: 'text-mint-400', bgColor: 'bg-mint-500/20', label: 'Welcome' },
      booster_purchase: { icon: Zap, color: 'text-orange-400', bgColor: 'bg-orange-500/20', label: 'Booster' },
      redemption: { icon: ArrowUpRight, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', label: 'Withdrawal' },
    };
    return types[type] || { icon: TrendingUp, color: 'text-dark-400', bgColor: 'bg-dark-700', label: type };
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Balance Header */}
      <div className="bg-gradient-to-b from-dark-800 via-dark-850 to-dark-950 px-4 pt-6 pb-8">
        {/* Main Balance */}
        <div className="text-center mb-6">
          <p className="text-sm text-dark-400 mb-1">Your Balance</p>
          <h1 className="text-4xl font-black text-white mb-1">
            {formatSatz(balance)}
            <span className="text-xl text-dark-400 ml-2">SATZ</span>
          </h1>
          <p className="text-lg text-mint-400 font-medium">{balanceUsd}</p>
          <p className="text-xs text-dark-500 mt-1">1 SATZ = 1 Satoshi</p>
        </div>

        {/* Withdrawal Progress */}
        <div className="bg-dark-800/70 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {withdrawalProgress.canWithdraw ? (
                <Unlock size={16} className="text-green-400" />
              ) : (
                <Lock size={16} className="text-dark-400" />
              )}
              <span className="text-sm font-medium text-white">
                {withdrawalProgress.canWithdraw ? 'Ready to Withdraw!' : 'Progress to Withdrawal'}
              </span>
            </div>
            <span className="text-sm text-dark-400">
              {formatSatz(balance)} / {formatSatz(WITHDRAWAL_MINIMUM)}
            </span>
          </div>
          
          <div className="h-3 bg-dark-700 rounded-full overflow-hidden mb-3">
            <motion.div
              className={`h-full rounded-full ${
                withdrawalProgress.canWithdraw 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                  : 'bg-gradient-to-r from-mint-500 to-cyan-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${withdrawalProgress.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-dark-400">
              {withdrawalProgress.canWithdraw 
                ? '🎉 You can withdraw now!'
                : formatToMilestone(balance)
              }
            </p>
            {withdrawalProgress.canWithdraw ? (
              <Link 
                to="/wallet/redeem"
                className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold"
              >
                Withdraw
              </Link>
            ) : (
              <span className="text-xs text-dark-500">
                {withdrawalProgress.percentage.toFixed(0)}% complete
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 -mt-2">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link 
            to="/wallet/redeem"
            className={`p-4 rounded-xl border ${
              withdrawalProgress.canWithdraw 
                ? 'bg-green-500/10 border-green-500/30 hover:border-green-500' 
                : 'bg-dark-800 border-white/5'
            } transition-colors`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
              withdrawalProgress.canWithdraw ? 'bg-green-500/20' : 'bg-dark-700'
            }`}>
              <ArrowUpRight size={20} className={withdrawalProgress.canWithdraw ? 'text-green-400' : 'text-dark-400'} />
            </div>
            <h3 className="font-semibold text-white text-sm">Withdraw</h3>
            <p className="text-xs text-dark-400">
              {withdrawalProgress.canWithdraw ? 'Ready!' : `Min ${formatSatz(WITHDRAWAL_MINIMUM)}`}
            </p>
          </Link>
          
          <Link 
            to="/wallet/transactions"
            className="bg-dark-800 p-4 rounded-xl border border-white/5 hover:border-mint-500/30 transition-colors"
          >
            <div className="w-10 h-10 bg-dark-700 rounded-xl flex items-center justify-center mb-2">
              <History size={20} className="text-dark-300" />
            </div>
            <h3 className="font-semibold text-white text-sm">History</h3>
            <p className="text-xs text-dark-400">View all transactions</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-dark-800 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{formatCompact(user?.total_earned || 0)}</p>
            <p className="text-2xs text-dark-400">Total Earned</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{formatCompact(user?.total_won || 0)}</p>
            <p className="text-2xs text-dark-400">SATZ Won</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{user?.referral_count || 0}</p>
            <p className="text-2xs text-dark-400">Referrals</p>
          </div>
        </div>

        {/* Referral Earnings */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              <span className="font-semibold text-white">Referral Earnings</span>
            </div>
            <span className="text-sm text-blue-400 font-medium">7% lifetime</span>
          </div>
          
          <p className="text-xs text-dark-400 mb-3">
            Earn 7% of everything your friends earn, forever!
          </p>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyReferral}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-colors"
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-400" />
                <span className="text-sm font-medium text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Copy Referral Link</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Recent Activity</h2>
            <Link to="/wallet/transactions" className="text-mint-400 text-xs flex items-center">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 bg-dark-800 rounded-xl">
              <History size={32} className="mx-auto mb-2 text-dark-600" />
              <p className="text-dark-400 text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => {
                const info = getTransactionInfo(tx.type);
                const Icon = info.icon;
                const isPositive = Number(tx.amount) > 0;
                
                return (
                  <div 
                    key={tx.id}
                    className="bg-dark-800 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${info.bgColor}`}>
                      <Icon size={18} className={info.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {tx.description || info.label}
                      </p>
                      <p className="text-xs text-dark-500">
                        {formatRelativeTime(tx.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{formatSatz(tx.amount)}
                      </p>
                      <p className="text-xs text-dark-500">
                        {satzUsdValue(Math.abs(tx.amount), btcPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-dark-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white mb-1">About SATZ</p>
              <p className="text-xs text-dark-400">
                1 SATZ = 1 satoshi = 0.00000001 BTC. Your SATZ is always backed 1:1 by real Bitcoin in our vault. 
                Withdraw anytime once you reach {formatSatz(WITHDRAWAL_MINIMUM)} SATZ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
