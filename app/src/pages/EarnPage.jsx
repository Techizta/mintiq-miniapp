import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayCircle, Calendar, Gift, Target, Users, 
  CheckCircle, Lock, TrendingUp, Bitcoin,
  ChevronRight, Sparkles, Crown, RotateCw
} from 'lucide-react';
import api from '../services/api';
import telegram from '../services/telegram';
import adsgramService from '../services/adsgram';
import { useUserStore } from '../stores/userStore';

export default function EarnPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useUserStore();
  const [earnData, setEarnData] = useState({
    daily: { canClaim: false, streak: 0 },
    ads: { watched: 0, remaining: 10, isLoading: false },
    spin: { canSpin: false, isSpinning: false },
    premium: { isPremium: false, weeklyDrop: 0, canClaimDrop: false, nextDropDays: 0 },
    comeback: { eligible: false, amount: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [spinResult, setSpinResult] = useState(null);

  useEffect(() => {
    fetchEarnData();
    if (adsgramService.isAvailable()) {
      adsgramService.init();
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEarnData = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/miniapp/earn/status');
      setEarnData(data);
    } catch (error) {
      console.error('Failed to fetch earn data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const satsToUsd = (sats) => {
    const btcPrice = 105000;
    return ((sats / 100000000) * btcPrice).toFixed(2);
  };

  const handleDailyClaim = async () => {
    if (!earnData.daily.canClaim) return;
    try {
      telegram.hapticImpact('medium');
      const result = await api.post('/api/miniapp/earn/daily/claim');
      if (result.success) {
        telegram.hapticNotification('success');
        showToast(`₿ +${result.satsEarned} SATZ earned!`, 'success');
        setEarnData(prev => ({
          ...prev,
          daily: { ...prev.daily, canClaim: false, streak: result.streak }
        }));
        refreshUser();
      }
    } catch (error) {
      showToast(error.message || 'Failed to claim', 'error');
    }
  };

  const handleWatchAd = async () => {
    if (earnData.ads.isLoading || earnData.ads.remaining <= 0) return;
    setEarnData(prev => ({ ...prev, ads: { ...prev.ads, isLoading: true } }));
    try {
      telegram.hapticImpact('light');
      const adResult = await adsgramService.showAd();
      if (adResult.success && adResult.reward) {
        const result = await api.post('/api/miniapp/earn/watch-ad');
        if (result.success) {
          telegram.hapticNotification('success');
          showToast(`₿ +${result.satsEarned} SATZ earned!`, 'success');
          setEarnData(prev => ({
            ...prev,
            ads: { watched: prev.ads.watched + 1, remaining: result.adsRemaining, isLoading: false }
          }));
          refreshUser();
        }
      } else {
        showToast('Watch the full ad to earn SATZ', 'warning');
      }
    } catch (error) {
      showToast(error.message || 'No ads available', 'error');
    } finally {
      setEarnData(prev => ({ ...prev, ads: { ...prev.ads, isLoading: false } }));
    }
  };

  const handleSpin = async () => {
    if (!earnData.spin.canSpin || earnData.spin.isSpinning) return;
    setEarnData(prev => ({ ...prev, spin: { ...prev.spin, isSpinning: true } }));
    try {
      telegram.hapticImpact('heavy');
      const result = await api.post('/api/miniapp/earn/spin');
      if (result.success) {
        setSpinResult(result.reward);
        setTimeout(() => {
          telegram.hapticNotification('success');
          showToast(`🎰 +${result.reward} SATZ won!`, 'success');
          setSpinResult(null);
          setEarnData(prev => ({
            ...prev,
            spin: { canSpin: result.canSpinAgain, isSpinning: false }
          }));
          refreshUser();
        }, 2000);
      }
    } catch (error) {
      showToast(error.message || 'Spin failed', 'error');
      setEarnData(prev => ({ ...prev, spin: { ...prev.spin, isSpinning: false } }));
    }
  };

  const handleClaimPremiumDrop = async () => {
    if (!earnData.premium.canClaimDrop) return;
    try {
      telegram.hapticImpact('heavy');
      const result = await api.post('/api/miniapp/earn/premium/claim-drop');
      if (result.success) {
        telegram.hapticNotification('success');
        showToast(`👑 +${result.satsEarned} SATZ Premium Drop!`, 'success');
        setEarnData(prev => ({
          ...prev,
          premium: { ...prev.premium, canClaimDrop: false, nextDropDays: 7 }
        }));
        refreshUser();
      }
    } catch (error) {
      showToast(error.message || 'Failed to claim', 'error');
    }
  };

  const handleClaimComeback = async () => {
    if (!earnData.comeback.eligible) return;
    try {
      telegram.hapticImpact('medium');
      const result = await api.post('/api/miniapp/earn/comeback');
      if (result.success) {
        telegram.hapticNotification('success');
        showToast(`🎁 Welcome back! +${result.satsEarned} SATZ!`, 'success');
        setEarnData(prev => ({ ...prev, comeback: { eligible: false, amount: 0 } }));
        refreshUser();
      }
    } catch (error) {
      showToast(error.message || 'Failed to claim', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-mint-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl text-white text-center font-medium ${
              toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {spinResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }}
              className="bg-gradient-to-br from-yellow-500 to-orange-500 w-32 h-32 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">+{spinResult}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-b from-dark-900 to-dark-950 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 border ${
            earnData.premium.isPremium 
              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/30'
              : 'bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border-orange-500/30'
          }`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Bitcoin size={20} className="text-orange-400" />
              <span className="text-orange-300 text-sm font-medium">Your Bitcoin Stack</span>
            </div>
            {earnData.premium.isPremium && (
              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                <Crown size={12} className="text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold">PREMIUM</span>
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{(user?.satz_balance || 0).toLocaleString()}</span>
            <span className="text-orange-400 font-medium">SATZ</span>
          </div>
          <p className="text-dark-400 text-sm mt-1">≈ ${satsToUsd(user?.satz_balance || 0)} USD</p>
        </motion.div>
        <p className="text-center text-dark-500 text-xs mt-3">1 SATZ = 1 Satoshi • Real Bitcoin Value</p>
      </div>

      {earnData.comeback.eligible && (
        <div className="px-4 py-2">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-500/30 rounded-xl flex items-center justify-center">
                <Gift size={24} className="text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Welcome Back! 🎉</h3>
                <p className="text-sm text-dark-400">We missed you! Claim your bonus</p>
              </div>
              <button onClick={handleClaimComeback} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl">
                +{earnData.comeback.amount} SATZ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {earnData.premium.isPremium && earnData.premium.canClaimDrop && (
        <div className="px-4 py-2">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/30 rounded-xl flex items-center justify-center animate-pulse">
                <Crown size={24} className="text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Weekly Premium Drop!</h3>
                <p className="text-sm text-dark-400">Your weekly SATZ are ready</p>
              </div>
              <button onClick={handleClaimPremiumDrop} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl">
                +600 SATZ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="px-4 py-2 space-y-3">
        <div className="flex items-center gap-2 mt-2 mb-1">
          <Bitcoin size={16} className="text-orange-400" />
          <h2 className="text-sm font-semibold text-dark-400 uppercase tracking-wide">Earn Real SATZ</h2>
        </div>
        
        {/* Tasks - Advertiser Tasks */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/earn/tasks")}
          className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-4 cursor-pointer hover:border-blue-500/40 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle size={28} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Complete Tasks</h3>
                <span className="px-2 py-0.5 bg-blue-500/20 rounded text-xs text-blue-400 font-medium">50-200 SATZ</span>
              </div>
              <p className="text-sm text-dark-400 mt-0.5">Join channels, visit sites, follow accounts</p>
            </div>
            <ChevronRight size={20} className="text-dark-500" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
              <PlayCircle size={28} className="text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Watch Ads</h3>
                <span className="px-2 py-0.5 bg-green-500/20 rounded text-xs text-green-400 font-medium">+2 SATZ</span>
              </div>
              <p className="text-sm text-dark-400 mt-0.5">{earnData.ads.remaining}/10 remaining • +20 SATZ/day max</p>
              <div className="flex gap-1 mt-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < earnData.ads.watched ? 'bg-green-500' : 'bg-dark-700'}`} />
                ))}
              </div>
            </div>
            <button onClick={handleWatchAd} disabled={earnData.ads.isLoading || earnData.ads.remaining <= 0}
              className={`px-5 py-3 rounded-xl font-bold transition-all ${
                earnData.ads.remaining > 0 && !earnData.ads.isLoading
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
                  : 'bg-dark-700 text-dark-500'
              }`}>
              {earnData.ads.isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : earnData.ads.remaining > 0 ? '▶ Watch' : <Lock size={18} />}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-dark-800 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Calendar size={28} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Daily Check-in</h3>
                <span className="px-2 py-0.5 bg-yellow-500/20 rounded text-xs text-yellow-400 font-medium">
                  +{earnData.premium.isPremium ? '10' : '5'} SATZ
                </span>
                {earnData.daily.streak > 0 && (
                  <span className="px-2 py-0.5 bg-orange-500/20 rounded text-xs text-orange-400">🔥 {earnData.daily.streak}</span>
                )}
              </div>
              <p className="text-sm text-dark-400 mt-0.5">{earnData.premium.isPremium ? '2x Premium bonus!' : 'Daily Bitcoin reward'}</p>
            </div>
            <button onClick={handleDailyClaim} disabled={!earnData.daily.canClaim}
              className={`px-5 py-3 rounded-xl font-bold transition-all ${
                earnData.daily.canClaim
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/25'
                  : 'bg-dark-700 text-dark-500'
              }`}>
              {earnData.daily.canClaim ? 'Claim' : <CheckCircle size={18} />}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-dark-800 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center ${earnData.spin.isSpinning ? 'animate-spin' : ''}`}>
              <RotateCw size={28} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Spin Wheel</h3>
                <span className="px-2 py-0.5 bg-purple-500/20 rounded text-xs text-purple-400 font-medium">1-20 SATZ</span>
              </div>
              <p className="text-sm text-dark-400 mt-0.5">{earnData.spin.canSpin ? 'Ready to spin!' : 'Come back tomorrow'}</p>
            </div>
            <button onClick={handleSpin} disabled={!earnData.spin.canSpin || earnData.spin.isSpinning}
              className={`px-5 py-3 rounded-xl font-bold transition-all ${
                earnData.spin.canSpin && !earnData.spin.isSpinning
                  ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-dark-700 text-dark-500'
              }`}>
              {earnData.spin.isSpinning ? '...' : earnData.spin.canSpin ? 'Spin!' : <Lock size={18} />}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          onClick={() => navigate('/predict')}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-4 cursor-pointer hover:border-purple-500/40 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Target size={28} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Win Predictions</h3>
                <span className="px-2 py-0.5 bg-purple-500/20 rounded text-xs text-purple-400 font-medium">Up to 2x</span>
              </div>
              <p className="text-sm text-dark-400 mt-0.5">Bet SATZ, predict correctly, win big!</p>
            </div>
            <ChevronRight size={20} className="text-dark-500" />
          </div>
        </motion.div>

        {!earnData.premium.isPremium && (
          <>
            <div className="flex items-center gap-2 mt-6 mb-1">
              <Crown size={16} className="text-yellow-400" />
              <h2 className="text-sm font-semibold text-dark-400 uppercase tracking-wide">Go Premium</h2>
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              onClick={() => navigate('/premium')}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 cursor-pointer hover:border-yellow-500/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Crown size={28} className="text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Premium Membership</h3>
                  <p className="text-sm text-dark-400 mt-0.5">600 SATZ/week • 2x daily bonus • No ads</p>
                  <p className="text-xs text-yellow-400 mt-1">Just $4.99/month → ~2,850 SATZ/month value!</p>
                </div>
                <span className="text-yellow-400 font-bold">$4.99</span>
              </div>
            </motion.div>
          </>
        )}

        <div className="flex items-center gap-2 mt-6 mb-1">
          <TrendingUp size={16} className="text-mint-400" />
          <h2 className="text-sm font-semibold text-dark-400 uppercase tracking-wide">Grow Your Stack</h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-mint-500/10 to-green-500/5 border border-mint-500/20 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-mint-500/20 rounded-xl flex items-center justify-center">
              <Users size={28} className="text-mint-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Invite Friends</h3>
                <span className="px-2 py-0.5 bg-mint-500/20 rounded text-xs text-mint-400 font-medium">+25 SATZ + 10%</span>
              </div>
              <p className="text-sm text-dark-400 mt-0.5">25 SATZ bonus + 10% of their earnings forever</p>
            </div>
            <button onClick={() => {
                telegram.hapticImpact('light');
                const code = user?.referral_code || user?.id;
                telegram.shareUrl(`https://t.me/MintIQBot?start=ref_${code}`, '🎯 Join MintIQ! Predict crypto, earn real Bitcoin satoshis!');
              }}
              className="px-5 py-3 rounded-xl font-bold bg-mint-500 hover:bg-mint-600 text-black shadow-lg shadow-mint-500/25 transition-all">
              Invite
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white text-sm">How it works</h4>
              <p className="text-dark-400 text-xs mt-1 leading-relaxed">
                Every SATZ = 1 real Bitcoin satoshi. Stack sats daily through ads, predictions, and bonuses. 
                Withdraw to your Bitcoin wallet at 10,000 SATZ (~$10).
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
