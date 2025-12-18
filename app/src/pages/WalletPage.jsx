import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  ChevronRight,
  TrendingUp,
  Target,
  Gift,
  Bitcoin
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import telegram from '../services/telegram';
import { formatSatz, formatCompact, getTierInfo, getTierProgress } from '../utils/helpers';
import { LIMITS } from '../utils/constants';

export default function WalletPage() {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser(true);
  }, []);

  const tierInfo = getTierInfo(user?.tier || 'novice');
  const tierProgress = getTierProgress(user?.tier_points || 0);
  const balance = user?.satz_balance || 0;
  const canRedeem = balance >= LIMITS.MIN_REDEMPTION;
  
  // Approximate USD value (1 SATZ ≈ $0.0001)
  const usdValue = (balance * 0.0001).toFixed(2);

  const stats = [
    { label: 'Total Earned', value: user?.total_earned || 0, icon: TrendingUp, color: 'text-success' },
    { label: 'Total Won', value: user?.total_won || 0, icon: Target, color: 'text-mint-400' },
    { label: 'Total Spent', value: user?.total_spent || 0, icon: ArrowUpRight, color: 'text-danger' },
  ];

  return (
    <div className="pb-4">
      {/* Balance Card */}
      <div className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-dark-800 to-dark-900 p-6 border border-white/10"
        >
          {/* Balance Display */}
          <div className="text-center mb-6">
            <p className="text-dark-400 text-sm mb-1">Your Balance</p>
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-gradient-gold mb-1"
            >
              {formatSatz(balance)}
            </motion.h1>
            <p className="text-lg text-dark-400">SATZ</p>
            <p className="text-sm text-dark-500 mt-1">≈ ${usdValue} USD</p>
          </div>

          {/* Tier Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: tierInfo.color }}>
                {tierInfo.name}
              </span>
              {tierProgress.next && (
                <span className="text-sm text-dark-400">
                  Next: {tierProgress.next.name}
                </span>
              )}
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tierProgress.progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: tierInfo.color }}
              />
            </div>
            <p className="text-xs text-dark-500 mt-1">
              {user?.tier_points || 0} / {tierProgress.next?.points || '∞'} points
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/earn">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="bg-success/20 hover:bg-success/30 rounded-xl p-3 flex items-center gap-2 transition-colors"
              >
                <ArrowDownLeft size={20} className="text-success" />
                <span className="text-white font-medium">Earn</span>
              </motion.div>
            </Link>
            <Link to="/wallet/redeem">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={`rounded-xl p-3 flex items-center gap-2 transition-colors ${
                  canRedeem 
                    ? 'bg-btc/20 hover:bg-btc/30' 
                    : 'bg-dark-700 opacity-50'
                }`}
              >
                <Bitcoin size={20} className={canRedeem ? 'text-btc' : 'text-dark-400'} />
                <span className={canRedeem ? 'text-white font-medium' : 'text-dark-400'}>
                  Redeem
                </span>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-3 text-center"
            >
              <stat.icon size={18} className={`mx-auto mb-1 ${stat.color}`} />
              <p className="text-lg font-bold text-white">{formatCompact(stat.value)}</p>
              <p className="text-2xs text-dark-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Redemption Progress */}
      <div className="px-4 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">BTC Redemption Progress</h3>
            <Link to="/vault" className="text-mint-400 text-sm">
              View Vault
            </Link>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-dark-400">{formatSatz(balance)} SATZ</span>
              <span className="text-dark-400">{formatSatz(LIMITS.MIN_REDEMPTION)} needed</span>
            </div>
            <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (balance / LIMITS.MIN_REDEMPTION) * 100)}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-btc rounded-full"
              />
            </div>
          </div>

          {canRedeem ? (
            <Link to="/wallet/redeem">
              <button className="w-full btn-gold mt-3">
                <Bitcoin size={18} />
                Redeem for BTC
              </button>
            </Link>
          ) : (
            <p className="text-sm text-dark-400 text-center mt-2">
              {formatSatz(LIMITS.MIN_REDEMPTION - balance)} more SATZ needed
            </p>
          )}
        </motion.div>
      </div>

      {/* Transaction History Link */}
      <div className="px-4 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/wallet/transactions">
            <div className="card card-hover p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                    <History size={20} className="text-dark-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Transaction History</h3>
                    <p className="text-sm text-dark-400">View all your transactions</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-dark-400" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Multiplier Info */}
      <div className="px-4 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-4 bg-mint-500/10 border-mint-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mint-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-mint-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">
                {tierInfo.multiplier}x Earnings Multiplier
              </h3>
              <p className="text-sm text-dark-400">
                {tierInfo.name} tier bonus active
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
