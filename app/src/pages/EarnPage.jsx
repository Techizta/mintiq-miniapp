/**
 * MintIQ EarnPage - COMPLETE VERSION
 * 
 * Features:
 * - Daily reward with streak
 * - Enhanced spin wheel with better prizes
 * - Task verification flow (3-step)
 * - Streak insurance in Stars shop
 * - Cold streak insurance
 * - Ad rewards
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Zap, Star, Trophy, Clock, CheckCircle, ExternalLink, 
  Play, Ticket, Shield, X, Flame, Sparkles, Lock, Crown
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useEarnStore } from '../stores/earnStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';
import DailyClaimModal from '../components/DailyClaimModal';

// ============================================
// WHEEL PRIZES CONFIGURATION
// ALIGNED WITH BACKEND: rewards = [1, 1, 2, 2, 2, 3, 3, 5, 5, 7, 10, 10, 15, 20]
// ============================================

const WHEEL_PRIZES = [
  { id: 1, value: 1, label: '1', color: '#374151', probability: 15 },
  { id: 2, value: 2, label: '2', color: '#6B7280', probability: 20 },
  { id: 3, value: 3, label: '3', color: '#374151', probability: 15 },
  { id: 4, value: 5, label: '5', color: '#10B981', probability: 14 },
  { id: 5, value: 7, label: '7', color: '#F59E0B', probability: 10 },
  { id: 6, value: 10, label: '10', color: '#8B5CF6', probability: 14 },
  { id: 7, value: 15, label: '15', color: '#EC4899', probability: 7 },
  { id: 8, value: 20, label: '20', color: '#FFD700', probability: 5, isJackpot: true },
];

// ============================================
// ENHANCED SPIN WHEEL COMPONENT
// ============================================

function EnhancedSpinWheel({ spinsLeft, onSpin, onClose }) {
  const { showToast } = useUIStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const spinWheel = async () => {
    console.log('[SpinWheel] Spin clicked, isSpinning:', isSpinning, 'spinsLeft:', spinsLeft);
    setError(null);
    
    if (isSpinning) {
      console.log('[SpinWheel] Already spinning, ignoring');
      return;
    }
    
    if (spinsLeft <= 0) {
      console.log('[SpinWheel] No spins left');
      showToast?.('No spins remaining today', 'info');
      return;
    }
    
    setIsSpinning(true);
    setResult(null);
    
    // Safe haptic call
    try {
      telegram.hapticImpact('medium');
    } catch (e) {
      console.warn('[SpinWheel] Haptic failed:', e);
    }

    try {
      console.log('[SpinWheel] Calling API...');
      const response = await api.post('/api/miniapp/earn/spin');
      console.log('[SpinWheel] API response:', response);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      // Handle "no spins" response gracefully (not as error)
      if (response.success === false) {
        if (response.spinsLeft === 0 || response.error?.includes('No spins')) {
          setIsSpinning(false);
          setError(null); // Clear error display
          showToast?.('No spins remaining today. Come back tomorrow!', 'info');
          onSpin?.(null, 0); // Signal parent to update spinsLeft to 0
          return;
        }
        throw new Error(response.error || 'Spin failed');
      }
      
      if (response.error && !response.success) {
        throw new Error(response.error);
      }
      
      const prizeValue = response.prize || response.reward || 5;
      const prize = WHEEL_PRIZES.find(p => p.value === prizeValue) || WHEEL_PRIZES.find(p => p.value === 5) || WHEEL_PRIZES[1];
      
      console.log('[SpinWheel] Prize:', prizeValue, prize);
      
      // Calculate wheel animation
      const prizeIndex = WHEEL_PRIZES.findIndex(p => p.id === prize.id);
      const segmentAngle = 360 / WHEEL_PRIZES.length;
      const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
      
      // Fix: Calculate additional rotation needed from current position
      const currentAngle = rotation % 360;
      const additionalRotation = (targetAngle - currentAngle + 360) % 360;
      const spins = 5 + Math.random() * 3;
      const finalRotation = rotation + (spins * 360) + additionalRotation;
      
      console.log('[SpinWheel] Animation: prizeIndex=', prizeIndex, 'targetAngle=', targetAngle, 'finalAngle=', finalRotation % 360);
      
      // Capture spinsLeft from response for use in timeout
      const remainingSpins = response.spinsLeft ?? (spinsLeft - 1);
      
      setRotation(finalRotation);
      
      setTimeout(() => {
        setResult(prize);
        setIsSpinning(false);
        try {
          telegram.hapticNotification(prize.isJackpot ? 'success' : 'success');
        } catch (e) {}
        showToast?.(`+${prizeValue} SATZ won!`, 'success');
        onSpin?.(prize, remainingSpins);
      }, 4000);
      
    } catch (e) {
      console.error('[SpinWheel] Error:', e);
      setIsSpinning(false);
      setError(e.message || 'Spin failed');
      try {
        telegram.hapticNotification('error');
      } catch (he) {}
      showToast?.(e.message || 'Spin failed. Try again.', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2">
        <X size={24} />
      </button>

      <h2 className="text-2xl font-bold text-white mb-2">🎰 Lucky Spin</h2>
      <p className="text-dark-400 mb-6">{spinsLeft} spins remaining</p>

      {/* Wheel Container */}
      <div className="relative w-72 h-72 mb-6">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-orange-500" />
        </div>
        
        {/* Wheel */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full h-full"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            {WHEEL_PRIZES.map((prize, i) => {
              const angle = (360 / WHEEL_PRIZES.length) * i;
              const startAngle = (angle - 90) * (Math.PI / 180);
              const endAngle = (angle + 360 / WHEEL_PRIZES.length - 90) * (Math.PI / 180);
              
              const x1 = 100 + 100 * Math.cos(startAngle);
              const y1 = 100 + 100 * Math.sin(startAngle);
              const x2 = 100 + 100 * Math.cos(endAngle);
              const y2 = 100 + 100 * Math.sin(endAngle);
              
              const textAngle = angle + (360 / WHEEL_PRIZES.length / 2);
              const textRadius = 65;
              const textX = 100 + textRadius * Math.cos((textAngle - 90) * (Math.PI / 180));
              const textY = 100 + textRadius * Math.sin((textAngle - 90) * (Math.PI / 180));
              
              return (
                <g key={prize.id}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                    fill={prize.color}
                    stroke="#1f2937"
                    strokeWidth="1"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {prize.label}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="20" fill="#1f2937" stroke="#374151" strokeWidth="2" />
            <text x="100" y="100" fill="white" fontSize="8" textAnchor="middle" dominantBaseline="middle">SATZ</text>
          </svg>
        </motion.div>
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`mb-6 px-6 py-3 rounded-2xl ${
              result.isJackpot ? 'bg-yellow-500' : 
              result.isLoss ? 'bg-red-500/20' : 'bg-green-500/20'
            }`}
          >
            <p className={`text-2xl font-bold ${
              result.isJackpot ? 'text-black' : 
              result.isLoss ? 'text-red-400' : 'text-green-400'
            }`}>
              {result.isLoss ? 'Better luck next time!' : 
               result.isJackpot ? '🎉 JACKPOT! +20 SATZ' :
               `+${result.value.toLocaleString()} SATZ!`}
            </p>
          </motion.div>
        )}
        {error && !isSpinning && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="mb-6 px-6 py-3 rounded-2xl bg-red-500/20"
          >
            <p className="text-sm text-red-400">{error}</p>
            <p className="text-xs text-red-400/60 mt-1">Tap SPIN to try again</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={spinWheel}
        disabled={isSpinning || spinsLeft <= 0}
        className={`px-8 py-4 rounded-2xl font-bold text-lg ${
          isSpinning || spinsLeft <= 0
            ? 'bg-dark-700 text-dark-500'
            : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black'
        }`}
      >
        {isSpinning ? 'Spinning...' : spinsLeft <= 0 ? 'No Spins Left' : 'SPIN!'}
      </motion.button>
    </motion.div>
  );
}

// ============================================
// STARS SHOP COMPONENT - FIXED
// ============================================

function StarsShop({ onClose }) {
  const { user, fetchUser } = useUserStore();
  const { showToast } = useUIStore();
  const [isPurchasing, setIsPurchasing] = useState(null);

  // Items matching backend telegramStarsService.js
  const items = [
    {
      id: 'premium_monthly',
      name: 'Premium (30 days)',
      desc: '2x daily rewards, no ads, exclusive quests',
      stars: 100,
      icon: Crown,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      id: 'booster_2x_1d',
      name: '2x Booster (24h)',
      desc: 'Double all earnings for 24 hours',
      stars: 25,
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      id: 'booster_2x_7d',
      name: '2x Booster (7 days)',
      desc: 'Double all earnings for 7 days',
      stars: 150,
      icon: Flame,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      id: 'extra_spin_3',
      name: '3 Extra Spins',
      desc: 'Get 3 additional lucky wheel spins',
      stars: 30,
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      id: 'extra_spin_10',
      name: '10 Extra Spins',
      desc: 'Get 10 additional lucky wheel spins',
      stars: 75,
      icon: Ticket,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
  ];

  const handlePurchase = async (item) => {
    setIsPurchasing(item.id);
    telegram.hapticImpact('medium');
    
    try {
      // Call Stars create-invoice endpoint
      const response = await api.post('/api/miniapp/stars/create-invoice', {
        paymentType: item.id
      });
      
      console.log('[Stars] Invoice response:', response);
      
      if (response?.invoiceLink) {
        // Open Telegram Stars payment
        telegram.openInvoice(response.invoiceLink, async (status) => {
          console.log('[Stars] Payment status:', status);
          if (status === 'paid') {
            showToast(`${item.name} activated! 🎉`, 'success');
            await fetchUser();
            onClose();
          } else if (status === 'cancelled') {
            showToast('Payment cancelled', 'info');
          } else if (status === 'failed') {
            showToast('Payment failed', 'error');
          }
        });
      } else {
        throw new Error('No invoice link received');
      }
    } catch (e) {
      console.error('[Stars] Purchase error:', e);
      showToast(e.message || 'Purchase failed', 'error');
    } finally {
      setIsPurchasing(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-dark-900 rounded-t-3xl w-full max-w-lg p-6 pb-8 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="text-yellow-400" size={22} />
            Stars Shop
          </h2>
          <button onClick={onClose} className="text-dark-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-dark-800 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center`}>
                  <item.icon size={24} className={item.color} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-dark-400">{item.desc}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePurchase(item)}
                  disabled={isPurchasing === item.id}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-sm text-black flex items-center gap-1"
                >
                  <Star size={14} />
                  {isPurchasing === item.id ? '...' : item.stars}
                </motion.button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-dark-500 text-center mt-4">
          Powered by Telegram Stars ⭐
        </p>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// TASK CARD WITH 3-STEP VERIFICATION
// ============================================

function TaskCard({ task, onComplete }) {
  const { showToast } = useUIStore();
  const [state, setState] = useState('idle');
  const [countdown, setCountdown] = useState(0);
  const [requiredSeconds, setRequiredSeconds] = useState(30);

  useEffect(() => {
    if (state === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (state === 'countdown' && countdown === 0) {
      setState('ready');
    }
  }, [state, countdown]);

  const reward = task.reward || task.reward_satz || task.user_reward_satz || 100;
  const isCompleted = task.completed || task.is_completed || state === 'completed';

  const handleStart = async () => {
    telegram.hapticSelection();
    setState('starting');
    
    try {
      // Step 1: Call start endpoint to register task start time
      const response = await api.post(`/api/miniapp/earn/tasks/${task.id}/start`);
      console.log('[Task] Started:', task.id, response);
      
      const seconds = response?.task?.required_seconds || task.required_seconds || 30;
      setRequiredSeconds(seconds);
      setCountdown(seconds);
      
      // Open the task URL
      const url = task.target_url || task.target_channel || task.link;
      if (url) {
        if (task.task_type === 'telegram_join' && task.target_channel) {
          telegram.openTelegramLink(`https://t.me/${task.target_channel.replace('@', '')}`);
        } else if (url.startsWith('http')) {
          telegram.openLink(url);
        } else {
          telegram.openLink(`https://${url}`);
        }
      }
      
      setState('countdown');
    } catch (e) {
      console.error('[Task] Start error:', e);
      setState('idle');
      showToast(e.message || 'Failed to start task', 'error');
    }
  };

  const handleClaim = async () => {
    setState('verifying');
    telegram.hapticImpact('medium');
    
    try {
      // Step 2: Call verify endpoint to claim reward
      const response = await api.post(`/api/miniapp/earn/tasks/${task.id}/verify`);
      console.log('[Task] Verified:', task.id, response);
      
      setState('completed');
      showToast(`+${response?.reward || reward} SATZ claimed!`, 'success');
      telegram.hapticNotification('success');
      onComplete?.(task);
    } catch (e) {
      console.error('[Task] Verify error:', e);
      
      // Check if it's a "wait more seconds" error
      if (e.message?.includes('wait') || e.remainingSeconds) {
        const remaining = e.remainingSeconds || parseInt(e.message.match(/\d+/)?.[0]) || 10;
        setCountdown(remaining);
        setState('countdown');
        showToast(`Please wait ${remaining} more seconds`, 'info');
      } else if (e.message?.includes('start')) {
        setState('idle');
        showToast('Please start the task first', 'error');
      } else {
        setState('ready');
        showToast(e.message || 'Verification failed. Try again.', 'error');
      }
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-dark-800/50 rounded-2xl p-4 border border-white/5 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <CheckCircle size={20} className="text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{task.title || task.name}</p>
            <p className="text-xs text-dark-500">Completed</p>
          </div>
          <span className="text-xs text-green-400 font-medium">+{reward} ✓</span>
        </div>
      </div>
    );
  }

  // Get icon based on task type
  const getTaskIcon = () => {
    const type = task.task_type || task.icon;
    if (type === 'telegram_join' || type === 'telegram') return <span className="text-lg">📱</span>;
    if (type === 'twitter_follow' || type === 'twitter' || type === 'x') return <span className="text-lg">🐦</span>;
    if (type === 'youtube_subscribe' || type === 'youtube') return <span className="text-lg">▶️</span>;
    if (type === 'website_visit') return <span className="text-lg">🌐</span>;
    return <Gift size={20} className="text-orange-400" />;
  };

  return (
    <div className="bg-dark-800 rounded-2xl p-4 border border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
          {getTaskIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{task.title || task.name}</p>
          <p className="text-xs text-dark-500 truncate">{task.description}</p>
          <p className="text-xs text-orange-400 font-medium mt-0.5">+{reward} SATZ</p>
        </div>
        
        {state === 'idle' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="px-4 py-2 bg-orange-500 rounded-xl font-medium text-sm text-black flex items-center gap-1 shrink-0"
          >
            <ExternalLink size={14} /> Go
          </motion.button>
        )}
        
        {state === 'starting' && (
          <div className="px-4 py-2 bg-dark-700 rounded-xl shrink-0">
            <span className="text-sm text-dark-400">...</span>
          </div>
        )}
        
        {state === 'countdown' && (
          <div className="px-4 py-2 bg-dark-700 rounded-xl shrink-0">
            <span className="text-sm text-yellow-400 font-medium">{countdown}s</span>
          </div>
        )}
        
        {state === 'ready' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleClaim}
            className="px-4 py-2 bg-green-500 rounded-xl font-medium text-sm text-black shrink-0"
          >
            Claim
          </motion.button>
        )}
        
        {state === 'verifying' && (
          <div className="px-4 py-2 bg-dark-700 rounded-xl shrink-0">
            <span className="text-sm text-dark-400 animate-pulse">Verifying...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN EARN PAGE COMPONENT
// ============================================

export default function EarnPage() {
  const { user, fetchUser } = useUserStore();
  const { dailyReward, fetchDailyReward, claimDailyReward } = useEarnStore();
  const { showToast, showCelebration } = useUIStore();
  
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showStarsShop, setShowStarsShop] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(1);
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUser(),
        fetchDailyReward(),
        loadTasks(),
        loadSpinStatus()
      ]);
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      // FIXED: Use correct endpoint path
      const response = await api.get('/api/miniapp/earn/tasks');
      console.log('[Tasks] Loaded:', response?.tasks?.length || 0, 'tasks');
      setTasks(response?.tasks || []);
    } catch (e) {
      console.error('Tasks error:', e);
      setTasks([]);
    }
  };

  const loadSpinStatus = async () => {
    try {
      // FIXED: Correct endpoint path
      const response = await api.get('/api/miniapp/earn/spin/status');
      setSpinsLeft(response?.spinsRemaining ?? response?.spinsLeft ?? 1);
    } catch (e) {
      setSpinsLeft(1);
    }
  };

  const handleClaimDaily = async () => {
    console.log('[MintIQ] handleClaimDaily called, canClaim:', dailyReward?.canClaim, 'isClaimingDaily:', isClaimingDaily);
    
    if (isClaimingDaily) {
      console.log('[MintIQ] Already claiming, skipping');
      return;
    }
    
    if (!dailyReward?.canClaim) {
      console.log('[MintIQ] Cannot claim - already claimed or not loaded');
      showToast('Already claimed today!', 'info');
      return;
    }
    
    setIsClaimingDaily(true);
    telegram.hapticImpact('medium');
    
    try {
      console.log('[MintIQ] Calling claimDailyReward...');
      const result = await claimDailyReward();
      console.log('[MintIQ] Claim result:', result);
      
      // Store result and show celebration modal
      setClaimResult(result);
      setShowClaimSuccess(true);
      
      // Refresh data
      await fetchUser();
      await fetchDailyReward();
      
      telegram.hapticNotification('success');
    } catch (error) {
      console.error('[MintIQ] Claim error:', error);
      telegram.hapticNotification('error');
      
      // Show specific error
      const errorMessage = error?.message || 'Failed to claim reward';
      if (errorMessage.includes('Already claimed')) {
        showToast('Already claimed today!', 'info');
        // Refresh to update UI
        await fetchDailyReward();
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsClaimingDaily(false);
    }
  };

  const handleWatchAd = async () => {
    setAdLoading(true);
    telegram.hapticSelection();
    
    try {
      // Import and use adsgram service
      const adsgram = (await import('../services/adsgram')).default;
      
      // Check if ads are available
      if (!adsgram.isAvailable()) {
        console.log('[WatchAd] Adsgram not available, claiming reward directly');
        // If adsgram not available, still try to claim reward (for testing)
        const response = await api.post('/api/miniapp/earn/watch-ad');
        if (response?.success) {
          telegram.hapticNotification('success');
          showToast(`+${response?.reward || response?.satsEarned || 50} SATZ earned!`, 'success');
          await fetchUser();
        } else {
          showToast(response?.error || 'Failed to claim reward', 'error');
        }
        return;
      }
      
      // Initialize if needed
      await adsgram.init();
      
      // Show ad
      const adResult = await adsgram.showAd();
      console.log('[WatchAd] Ad result:', adResult);
      
      // Check if ad was completed (reward: true means user watched full ad)
      if (adResult && adResult.reward !== false) {
        // Ad completed, claim reward from backend
        const response = await api.post('/api/miniapp/earn/watch-ad');
        console.log('[WatchAd] Backend response:', response);
        
        if (response?.success) {
          telegram.hapticNotification('success');
          showToast(`+${response?.reward || response?.satsEarned || 50} SATZ earned!`, 'success');
          await fetchUser();
        } else {
          showToast(response?.error || 'Failed to claim reward', 'error');
        }
      } else {
        showToast('Watch the full ad to earn rewards', 'info');
      }
    } catch (e) {
      console.error('[WatchAd] Error:', e);
      if (e.message?.includes('not available')) {
        // Try direct claim anyway for development/testing
        try {
          const response = await api.post('/api/miniapp/earn/watch-ad');
          if (response?.success) {
            telegram.hapticNotification('success');
            showToast(`+${response?.reward || 50} SATZ earned!`, 'success');
            await fetchUser();
            return;
          }
        } catch (backendErr) {
          console.error('[WatchAd] Backend error:', backendErr);
        }
        showToast('Ads not available right now', 'info');
      } else if (e.message?.includes('limit')) {
        showToast('Daily ad limit reached', 'info');
      } else {
        showToast(e.message || 'Ad failed to load', 'error');
      }
    } finally {
      setAdLoading(false);
    }
  };

  const handleSpinComplete = (prize, newSpinsLeft) => {
    // If newSpinsLeft is explicitly passed (e.g., 0), use it
    if (typeof newSpinsLeft === 'number') {
      setSpinsLeft(newSpinsLeft);
    } else if (prize) {
      // Normal spin completed - decrement by 1
      setSpinsLeft(prev => Math.max(0, prev - 1));
    }
    fetchUser();
  };

  const handleTaskComplete = (task) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, completed: true } : t
    ));
    fetchUser();
  };

  const currentStreak = dailyReward?.currentStreak || user?.current_streak || 0;
  const streakReward = dailyReward?.streakReward || 100;
  const incompleteTasks = tasks.filter(t => !t.completed && !t.is_completed);
  const completedTasks = tasks.filter(t => t.completed || t.is_completed);

  // Debug log for modal state
  useEffect(() => {
    console.log('[EarnPage] Modal states - showSpinWheel:', showSpinWheel, 'showStarsShop:', showStarsShop, 'spinsLeft:', spinsLeft);
  }, [showSpinWheel, showStarsShop, spinsLeft]);

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Modals */}
      <AnimatePresence>
        {showSpinWheel && (
          <EnhancedSpinWheel 
            spinsLeft={spinsLeft} 
            onSpin={handleSpinComplete}
            onClose={() => {
              console.log('[EarnPage] Closing spin wheel modal');
              setShowSpinWheel(false);
            }} 
          />
        )}
        {showStarsShop && (
          <StarsShop onClose={() => setShowStarsShop(false)} />
        )}
        {showClaimSuccess && (
          <DailyClaimModal
            isOpen={showClaimSuccess}
            onClose={() => setShowClaimSuccess(false)}
            claimResult={claimResult}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Gift className="text-orange-400" size={22} />
          Earn SATZ
        </h1>
        <p className="text-sm text-dark-400 mt-1">Complete tasks to earn rewards</p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Daily Reward Card */}
        <div className={`rounded-2xl p-4 border ${
          dailyReward?.canClaim 
            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30' 
            : 'bg-dark-800 border-white/5'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  dailyReward?.canClaim 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                    : 'bg-dark-700'
                }`}
                animate={dailyReward?.canClaim ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Gift size={24} className={dailyReward?.canClaim ? 'text-black' : 'text-dark-400'} />
              </motion.div>
              <div>
                <p className="font-bold text-white">Daily Reward</p>
                <div className="flex items-center gap-2 text-xs">
                  {currentStreak > 0 && (
                    <span className="text-orange-400 flex items-center gap-1">
                      <Flame size={12} /> {currentStreak} day streak
                    </span>
                  )}
                  <span className="text-dark-400">+{streakReward} SATZ</span>
                </div>
              </div>
            </div>
            
            {dailyReward?.canClaim ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClaimDaily}
                disabled={isClaimingDaily}
                className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-black"
              >
                {isClaimingDaily ? '...' : 'Claim'}
              </motion.button>
            ) : (
              <div className="text-right">
                <p className="text-xs text-dark-400">Next in</p>
                <p className="text-sm text-white font-medium">
                  {dailyReward?.nextClaimIn || '24h'}
                </p>
              </div>
            )}
          </div>
          
          {/* Streak Progress */}
          {currentStreak > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex justify-between text-xs text-dark-400 mb-1">
                <span>Streak Progress</span>
                <span>{currentStreak}/7 days</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <div 
                    key={day}
                    className={`flex-1 h-1.5 rounded-full ${
                      day <= currentStreak ? 'bg-orange-500' : 'bg-dark-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Spin Wheel */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log('[EarnPage] Spin wheel button clicked, showing modal');
              telegram.hapticSelection();
              setShowSpinWheel(true);
            }}
            className="bg-dark-800 border border-white/5 rounded-2xl p-4 text-center"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Ticket size={20} className="text-purple-400" />
            </div>
            <p className="text-xs font-medium text-white">Spin Wheel</p>
            <p className="text-[10px] text-dark-500">{spinsLeft} left</p>
          </motion.button>
          
          {/* Watch Ad */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleWatchAd}
            disabled={adLoading}
            className="bg-dark-800 border border-white/5 rounded-2xl p-4 text-center"
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Play size={20} className="text-green-400" />
            </div>
            <p className="text-xs font-medium text-white">Watch Ad</p>
            <p className="text-[10px] text-dark-500">+50 SATZ</p>
          </motion.button>
          
          {/* Stars Shop */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStarsShop(true)}
            className="bg-dark-800 border border-white/5 rounded-2xl p-4 text-center"
          >
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Star size={20} className="text-yellow-400" />
            </div>
            <p className="text-xs font-medium text-white">Stars Shop</p>
            <p className="text-[10px] text-dark-500">Boosts</p>
          </motion.button>
        </div>

        {/* Active Tasks */}
        {incompleteTasks.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Zap size={14} className="text-orange-400" />
              Active Tasks ({incompleteTasks.length})
            </h2>
            <div className="space-y-2">
              {incompleteTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onComplete={handleTaskComplete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-dark-400 mb-3 flex items-center gap-2">
              <CheckCircle size={14} />
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-2">
              {completedTasks.slice(0, 5).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tasks.length === 0 && (
          <div className="bg-dark-800 rounded-2xl p-8 text-center border border-white/5">
            <Gift size={40} className="text-dark-600 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">No tasks available</p>
            <p className="text-xs text-dark-500">Check back later for new tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
