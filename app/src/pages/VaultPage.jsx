import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, TrendingUp, Lock, Shield, Coins, RefreshCw } from 'lucide-react';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';

export default function VaultPage() {
  const [vault, setVault] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchVaultStatus(); }, []);

  const fetchVaultStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/miniapp/vault');
      setVault(response.vault);
    } catch (err) {
      console.error('Failed to fetch vault:', err);
      setError('Failed to load vault data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBTC = (btc) => {
    if (!btc || btc === 0) return '0.00000000';
    return parseFloat(btc).toFixed(8);
  };

  const formatUSD = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4">
        <Bitcoin size={48} className="text-dark-600 mb-4" />
        <p className="text-dark-400 mb-4">{error}</p>
        <button onClick={fetchVaultStatus} className="px-6 py-2 bg-orange-500 text-white rounded-xl font-medium flex items-center gap-2">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const btcAmount = parseFloat(vault?.balance_btc || 0);
  const satoshis = vault?.balance_satoshis || 0;
  const usdValue = vault?.usd_value || 0;
  const progressTo1BTC = Math.min(100, (btcAmount / 1) * 100);
  const circulatingSatz = vault?.circulating_satz || 0;
  const exchangeRate = vault?.satz_to_satoshi_rate || 0;

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Main Vault Display */}
      <div className="px-4 pt-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-900/20 border border-orange-500/30 rounded-xl p-6">
          
          <div className="flex justify-center mb-4">
            <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Bitcoin size={48} className="text-orange-500" />
            </motion.div>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-dark-400 mb-1">BTC Vault Balance</p>
            <h1 className="text-3xl font-bold text-orange-500">{formatBTC(btcAmount)} BTC</h1>
            <p className="text-lg text-dark-300">{formatUSD(usdValue)}</p>
            <p className="text-sm text-dark-500 mt-1">{satoshis.toLocaleString()} satoshis</p>
          </div>

          {/* Progress to 1 BTC */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-dark-400">Progress to 1 BTC</span>
              <span className="text-orange-400">{progressTo1BTC.toFixed(4)}%</span>
            </div>
            <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressTo1BTC}%` }}
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-dark-400">
            <Shield size={14} className="text-green-400" />
            <span>Secured & Verified</span>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mb-4">
        <h3 className="text-sm font-medium text-dark-400 mb-3">Vault Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <Coins size={20} className="text-purple-400 mb-2" />
            <p className="text-lg font-bold text-white">{formatSatz(circulatingSatz)}</p>
            <p className="text-xs text-dark-400">Circulating SATZ</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <TrendingUp size={20} className="text-green-400 mb-2" />
            <p className="text-lg font-bold text-white">{exchangeRate.toFixed(8)}</p>
            <p className="text-xs text-dark-400">SATZ → Satoshi Rate</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <Lock size={20} className="text-orange-400 mb-2" />
            <p className="text-lg font-bold text-white">{formatSatz(vault?.total_inflow || 0)}</p>
            <p className="text-xs text-dark-400">Total Inflow (sats)</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <Bitcoin size={20} className="text-red-400 mb-2" />
            <p className="text-lg font-bold text-white">{formatSatz(vault?.total_outflow || 0)}</p>
            <p className="text-xs text-dark-400">Total Outflow (sats)</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-4">
        <h3 className="text-sm font-medium text-dark-400 mb-3">How It Works</h3>
        <div className="bg-dark-800 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs text-orange-400 font-bold">1</div>
            <div><p className="text-white text-sm font-medium">Earn SATZ</p><p className="text-xs text-dark-400">Win predictions & complete tasks</p></div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs text-orange-400 font-bold">2</div>
            <div><p className="text-white text-sm font-medium">Vault Fills</p><p className="text-xs text-dark-400">Revenue funds the BTC vault</p></div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs text-orange-400 font-bold">3</div>
            <div><p className="text-white text-sm font-medium">Redeem BTC</p><p className="text-xs text-dark-400">Exchange SATZ for real Bitcoin</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
