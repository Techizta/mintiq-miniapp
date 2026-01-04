import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, TrendingUp, Lock, Shield, Coins, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { formatSatz } from '../utils/helpers';

export default function VaultPage() {
  const [vault, setVault] = useState(null);
  const [blockchain, setBlockchain] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchVaultStatus(); }, []);

  const fetchVaultStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/miniapp/vault');
      setVault(response.vault);
      setBlockchain(response.blockchain || null);
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

  // Blockchain data (real BTC on-chain)
  const onChainBtc = blockchain?.confirmed_btc || 0;
  const onChainSatoshis = blockchain?.confirmed_satoshis || 0;
  const onChainUsd = blockchain?.usd_value || 0;
  const btcPrice = blockchain?.btc_price || 100000;

  // Internal data (user earnings)
  const circulatingSatz = vault?.circulating_satz || 0;
  const exchangeRate = vault?.satz_to_satoshi_rate || 0;

  // Backing calculation
  const backingPercent = circulatingSatz > 0 
    ? Math.min(100, (onChainSatoshis / circulatingSatz) * 100) 
    : 100;

  // Progress to 1 BTC
  const progressTo1BTC = Math.min(100, (onChainBtc / 1) * 100);

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="px-4 pt-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">BTC Vault</h1>
          <button 
            onClick={fetchVaultStatus}
            className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-white transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Dual Balance Display */}
      <div className="px-4 mb-4 space-y-3">
        
        {/* On-Chain Balance (Blockchain Verified) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-900/20 border border-orange-500/30 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-dark-400">On-Chain Balance (Verified)</span>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Bitcoin size={28} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-orange-500">{formatBTC(onChainBtc)} BTC</h2>
              <p className="text-dark-400 text-sm">{onChainSatoshis.toLocaleString()} satoshis</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg text-green-400 font-medium">{formatUSD(onChainUsd)}</span>
            {blockchain?.explorer && (
              <a 
                href={blockchain.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
              >
                <ExternalLink size={12} />
                Verify on Mempool
              </a>
            )}
          </div>
        </motion.div>

        {/* Circulating SATZ (User Earnings) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-900/20 border border-purple-500/30 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            <span className="text-sm text-dark-400">Circulating SATZ (User Earnings)</span>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Coins size={28} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-400">{formatSatz(circulatingSatz)}</h2>
              <p className="text-dark-400 text-sm">SATZ in circulation</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-dark-500">≈ {formatUSD((circulatingSatz / 100000000) * btcPrice)}</span>
            <span className="text-xs text-purple-400">1 SATZ = 1 satoshi</span>
          </div>
        </motion.div>

        {/* Backing Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800 border border-white/5 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">Vault Backing Status</span>
            <div className="flex items-center gap-1">
              {backingPercent >= 100 ? (
                <CheckCircle size={14} className="text-green-400" />
              ) : null}
              <span className={`font-bold ${backingPercent >= 100 ? 'text-green-400' : backingPercent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {backingPercent.toFixed(1)}% Backed
              </span>
            </div>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${backingPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${backingPercent >= 100 ? 'bg-green-500' : backingPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            />
          </div>
          <p className="text-xs text-dark-500 mt-2">
            {onChainSatoshis.toLocaleString()} sats backing {circulatingSatz.toLocaleString()} SATZ
          </p>
        </motion.div>
      </div>

      {/* Progress to 1 BTC */}
      <div className="px-4 mb-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800 rounded-xl p-4 border border-white/5"
        >
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-400">Progress to 1 BTC</span>
            <span className="text-orange-400">{progressTo1BTC.toFixed(4)}%</span>
          </div>
          <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${Math.max(progressTo1BTC, 0.5)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
            />
          </div>
          <p className="text-xs text-dark-500 mt-2 text-center">
            {formatBTC(onChainBtc)} / 1.00000000 BTC
          </p>
        </motion.div>
      </div>

      {/* Blockchain Verification Link */}
      {blockchain?.address && (
        <div className="px-4 mb-4">
          <a 
            href={blockchain.explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-dark-800 rounded-xl p-4 border border-orange-500/20 hover:border-orange-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-green-400" />
              <span className="text-sm text-white font-medium">Verify on Bitcoin Blockchain</span>
            </div>
            <p className="text-xs text-orange-400 font-mono break-all">
              {blockchain.address}
            </p>
          </a>
        </div>
      )}

      {/* Stats Grid */}
      <div className="px-4 mb-4">
        <h3 className="text-sm font-medium text-dark-400 mb-3">Vault Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <TrendingUp size={20} className="text-green-400 mb-2" />
            <p className="text-lg font-bold text-white">{formatUSD(btcPrice)}</p>
            <p className="text-xs text-dark-400">BTC Price</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <Bitcoin size={20} className="text-orange-400 mb-2" />
            <p className="text-lg font-bold text-white">{exchangeRate.toFixed(8)}</p>
            <p className="text-xs text-dark-400">SATZ → Satoshi Rate</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <Lock size={20} className="text-blue-400 mb-2" />
            <p className="text-lg font-bold text-white">{formatSatz(vault?.total_inflow || 0)}</p>
            <p className="text-xs text-dark-400">Total Inflow</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <Coins size={20} className="text-red-400 mb-2" />
            <p className="text-lg font-bold text-white">{formatSatz(vault?.total_outflow || 0)}</p>
            <p className="text-xs text-dark-400">Total Outflow</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-4">
        <h3 className="text-sm font-medium text-dark-400 mb-3">How It Works</h3>
        <div className="bg-dark-800 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs text-orange-400 font-bold shrink-0">1</div>
            <div>
              <p className="text-white text-sm font-medium">Earn SATZ</p>
              <p className="text-xs text-dark-400">Win predictions & complete tasks</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs text-orange-400 font-bold shrink-0">2</div>
            <div>
              <p className="text-white text-sm font-medium">Vault Fills</p>
              <p className="text-xs text-dark-400">Revenue funds the BTC vault</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs text-orange-400 font-bold shrink-0">3</div>
            <div>
              <p className="text-white text-sm font-medium">Redeem BTC</p>
              <p className="text-xs text-dark-400">Exchange SATZ for real Bitcoin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
