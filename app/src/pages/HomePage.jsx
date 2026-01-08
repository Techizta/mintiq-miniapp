/**
 * MintIQ HomePage - COMPLETE VERSION
 * 
 * Features:
 * - Daily claim button restored
 * - 2-tap prediction from homepage
 * - Continuous activity feed
 * - Lucky Hour system
 * - Early Bird prediction bonus
 * - Daily Jackpot pool
 * - Friend's earnings notifications
 * - Badge avatar system
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Target, Users, Trophy, ChevronRight, Flame, Clock, Crown, Bot, 
  TrendingUp, Sparkles, AlertCircle, Gift, Star, Ticket, Bell, X,
  CheckCircle, PartyPopper
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useEarnStore } from '../stores/earnStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';
import { BADGES, getLatestBadge, isBadgeUnlocked } from './ProfilePage';
import DailyClaimModal from '../components/DailyClaimModal';

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

// Full number format for balance display (no abbreviation)
const formatExact = (num) => {
  if (!num && num !== 0) return '0';
  return Number(num).toLocaleString();
};

const getTimeInfo = (deadline) => {
  if (!deadline) return { text: 'Open', urgent: false };
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return { text: 'Ended', urgent: true };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours < 1) return { text: `${minutes}m left!`, urgent: true };
  if (hours < 6) return { text: `${hours}h ${minutes}m`, urgent: true };
  if (hours < 24) return { text: `${hours}h left`, urgent: false };
  return { text: `${Math.floor(hours / 24)}d left`, urgent: false };
};

// Check if it's Lucky Hour (random hour each day, or specific times)
const isLuckyHour = () => {
  const hour = new Date().getHours();
  // Lucky hours: 12-13, 18-19, 21-22
  return [12, 18, 21].includes(hour);
};

// Check if Early Bird (first 100 predictions on new quest)
const isEarlyBird = (quest) => {
  return (quest?.participant_count || 0) < 100;
};

// ============================================
// CONTINUOUS ACTIVITY FEED
// ============================================

function ContinuousActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    // Generate realistic activity data
    const names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Chris', 'Jamie', 'Riley', 'Casey', 'Drew', 'Avery', 'Quinn'];
    const actions = [
      { type: 'win', text: 'won', emoji: '🏆', color: 'text-green-400' },
      { type: 'bet', text: 'predicted', emoji: '🎯', color: 'text-blue-400' },
      { type: 'claim', text: 'claimed daily', emoji: '🎁', color: 'text-yellow-400' },
      { type: 'referral', text: 'invited a friend', emoji: '👥', color: 'text-purple-400' },
      { type: 'jackpot', text: 'entered jackpot', emoji: '🎰', color: 'text-pink-400' },
    ];
    const amounts = [100, 250, 500, 750, 1000, 1500, 2000, 2500, 5000];
    
    // Generate 20 activities
    const generated = Array.from({ length: 20 }, (_, i) => {
      const action = actions[Math.floor(Math.random() * actions.length)];
      return {
        id: i,
        name: names[Math.floor(Math.random() * names.length)],
        ...action,
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        time: Math.floor(Math.random() * 30) + 1
      };
    });
    setActivities(generated);
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [activities.length]);

  if (activities.length === 0) return null;
  const current = activities[currentIndex];

  return (
    <motion.div 
      key={currentIndex}
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 10 }}
      className="bg-dark-800/50 border border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 mb-4"
    >
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-xs text-dark-300 flex-1">
        <span className="font-medium text-white">{current.name}</span>
        {' '}{current.text}{' '}
        {current.type !== 'referral' && (
          <span className={`font-bold ${current.color}`}>
            {current.emoji} {formatNumber(current.amount)} SATZ
          </span>
        )}
        {current.type === 'referral' && <span className="text-purple-400">{current.emoji}</span>}
      </span>
      <span className="text-[10px] text-dark-500">{current.time}s ago</span>
    </motion.div>
  );
}

// ============================================
// FRIEND EARNINGS NOTIFICATION
// ============================================

function FriendEarningsNotification({ notification, onDismiss }) {
  if (!notification) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4"
    >
      <button onClick={onDismiss} className="absolute top-2 right-2 text-dark-400">
        <X size={16} />
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
          <Bell size={20} className="text-green-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">
            Your friend <span className="text-green-400">{notification.friendName}</span> just won!
          </p>
          <p className="text-xs text-dark-400">
            You earned <span className="text-green-400 font-bold">+{formatNumber(notification.commission)} SATZ</span> commission
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// LUCKY HOUR BANNER
// ============================================

function LuckyHourBanner() {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const minutesLeft = 60 - now.getMinutes();
      const secondsLeft = 60 - now.getSeconds();
      setTimeLeft(`${minutesLeft - 1}:${secondsLeft.toString().padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isLuckyHour()) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border border-yellow-500/30 rounded-xl p-3 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <Sparkles size={20} className="text-yellow-400" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-yellow-400">🎉 LUCKY HOUR!</p>
            <p className="text-xs text-dark-400">Peak activity time - more predictions!</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{timeLeft}</p>
          <p className="text-[10px] text-dark-500">remaining</p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// DAILY JACKPOT CARD
// ============================================

function DailyJackpotCard() {
  const [jackpot, setJackpot] = useState(null); // Start as null for loading
  const [isLoading, setIsLoading] = useState(true);
  const [timeToRoll, setTimeToRoll] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const { showToast, showCelebration } = useUIStore();

  useEffect(() => {
    // Load jackpot data
    const loadJackpot = async () => {
      try {
        const data = await api.get('/api/miniapp/jackpot/daily');
        if (data) setJackpot(data);
        else setJackpot({ pool: 500, entries: 0, userEntered: false });
      } catch (e) {
        // Use default values on error
        setJackpot({ pool: 500, entries: 0, userEntered: false });
      } finally {
        setIsLoading(false);
      }
    };
    loadJackpot();

    // Update countdown
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeToRoll(`${hours}h ${minutes}m`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleEnterJackpot = async () => {
    if (isEntering || !jackpot) return;
    setIsEntering(true);
    telegram.hapticImpact('heavy');
    
    try {
      await api.post('/api/miniapp/jackpot/enter');
      setJackpot(prev => ({ ...prev, userEntered: true, entries: prev.entries + 1 }));
      
      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Show celebration
      
      telegram.hapticNotification('success');
      
      showToast('🎰 You\'re in! Good luck!', 'success');
    } catch (e) {
      telegram.hapticNotification('error');
      showToast(e.message || 'Failed to enter', 'error');
    } finally {
      setIsEntering(false);
    }
  };

  // Calculate win chance (only when jackpot is loaded)
  const winChance = jackpot && jackpot.entries > 0 ? (1 / (jackpot.entries + 1) * 100).toFixed(2) : '100';

  // Show loading skeleton while fetching jackpot data
  if (isLoading || !jackpot) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Ticket size={18} className="text-purple-400" />
            <span className="font-bold text-white">Daily Jackpot</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-dark-400">
            <Clock size={12} />
            <span>Draws in {timeToRoll || '...'}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-24 bg-dark-700 rounded animate-pulse mb-1" />
            <div className="h-4 w-32 bg-dark-700 rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-dark-700 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 mb-4 relative overflow-hidden">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#a855f7', '#ec4899', '#f59e0b', '#22c55e'][Math.floor(Math.random() * 4)],
                }}
                initial={{ top: '50%', scale: 0 }}
                animate={{ 
                  top: '-20%', 
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 100,
                }}
                transition={{ duration: 1.5, delay: i * 0.05 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Ticket size={18} className="text-purple-400" />
          </motion.div>
          <span className="font-bold text-white">Daily Jackpot</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-dark-400">
          <Clock size={12} />
          <span>Draws in {timeToRoll}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-purple-400">{formatNumber(jackpot.pool)}</p>
          <p className="text-xs text-dark-500">SATZ Pool • {jackpot.entries} entries</p>
        </div>
        
        {jackpot.userEntered ? (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-right"
          >
            <div className="px-4 py-2 bg-purple-500/20 rounded-xl flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-sm text-green-400 font-medium">You're In!</span>
            </div>
            <p className="text-[10px] text-dark-500">Win chance: {winChance}%</p>
          </motion.div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleEnterJackpot}
            disabled={isEntering}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm text-white shadow-lg shadow-purple-500/25"
          >
            {isEntering ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entering...
              </span>
            ) : (
              '🎰 Enter Free'
            )}
          </motion.button>
        )}
      </div>
      
      {/* How it works - show only if not entered */}
      {!jackpot.userEntered && (
        <div className="mt-3 pt-3 border-t border-purple-500/10">
          <p className="text-[10px] text-dark-500 text-center">
            🎲 One lucky winner drawn at midnight UTC • Free entry daily
          </p>
        </div>
      )}
      
      {/* Post-entry info */}
      {jackpot.userEntered && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 pt-3 border-t border-purple-500/10"
        >
          <p className="text-[10px] text-dark-500 text-center">
            🍀 Winner announced at midnight UTC • Check back tomorrow for results!
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// 2-TAP PREDICTION MODAL
// ============================================

function QuickPredictModal({ quest, onClose, onPredict }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [amount, setAmount] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserStore();
  const { showToast } = useUIStore();
  
  const quickAmounts = [50, 100, 250, 500, 1000];
  const balance = Number(user?.satz_balance) || 0;
  
  const poolA = Number(quest?.pool_a) || 0;
  const poolB = Number(quest?.pool_b) || 0;
  
  // Calculate potential win using the accurate formula
  // Your share = (your_bet / winning_pool_after_bet) * (total_pool * 0.9)
  const calculatePotentialWin = () => {
    if (!selectedOption || amount <= 0) return 0;
    const myPool = selectedOption === 'a' ? poolA : poolB;
    const otherPool = selectedOption === 'a' ? poolB : poolA;
    
    const newMyPool = myPool + amount;
    const totalPool = newMyPool + otherPool;
    const winnerPool = totalPool * 0.9; // 10% platform fee
    
    if (newMyPool === 0) return 0;
    const yourShare = (amount / newMyPool) * winnerPool;
    return Math.floor(yourShare);
  };
  
  const potentialWin = calculatePotentialWin();
  const multiplier = amount > 0 ? (potentialWin / amount) : 0;
  
  const earlyBird = isEarlyBird(quest);
  const luckyHour = isLuckyHour();

  const handleSubmit = async () => {
    if (!selectedOption || amount <= 0) return;
    if (amount > balance) {
      showToast('Insufficient balance', 'error');
      return;
    }
    
    setIsSubmitting(true);
    telegram.hapticImpact('medium');
    
    try {
      await api.post(`/api/miniapp/quests/${quest.id}/bet`, {
        option: selectedOption,
        amount
      });
      showToast(`Prediction placed! Potential win: ${formatNumber(potentialWin)} SATZ`, 'success');
      onPredict?.();
      onClose();
    } catch (e) {
      showToast(e.message || 'Prediction failed', 'error');
    } finally {
      setIsSubmitting(false);
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
        transition={{ type: 'spring', damping: 25 }}
        className="bg-dark-900 rounded-t-3xl w-full max-w-lg p-6 pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Quick Predict</h2>
          <button onClick={onClose} className="p-2 text-dark-400">
            <X size={20} />
          </button>
        </div>

        {/* Bonuses */}
        {(earlyBird || luckyHour) && (
          <div className="flex gap-2 mb-4">
            {earlyBird && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium">
                🐦 Early Bird +50%
              </span>
            )}
            {luckyHour && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium">
                ⚡ Lucky Hour 2x
              </span>
            )}
          </div>
        )}

        {/* Question */}
        <p className="text-sm text-dark-300 mb-4 line-clamp-2">{quest?.title}</p>

        {/* Options - TAP 1 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { telegram.hapticSelection(); setSelectedOption('a'); }}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedOption === 'a' 
                ? 'bg-green-500/20 border-green-500' 
                : 'bg-dark-800 border-white/10'
            }`}
          >
            <p className="font-bold text-white mb-1">{quest?.option_a || 'Yes'}</p>
            <p className="text-xs text-green-400">{oddsA}% odds</p>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { telegram.hapticSelection(); setSelectedOption('b'); }}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedOption === 'b' 
                ? 'bg-red-500/20 border-red-500' 
                : 'bg-dark-800 border-white/10'
            }`}
          >
            <p className="font-bold text-white mb-1">{quest?.option_b || 'No'}</p>
            <p className="text-xs text-red-400">{oddsB}% odds</p>
          </motion.button>
        </div>

        {/* Amount Selection */}
        <div className="mb-4">
          <p className="text-xs text-dark-400 mb-2">Amount (Balance: {formatExact(balance)} SATZ)</p>
          <div className="flex gap-2 flex-wrap">
            {quickAmounts.map(amt => (
              <button
                key={amt}
                onClick={() => { telegram.hapticSelection(); setAmount(amt); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  amount === amt 
                    ? 'bg-orange-500 text-black' 
                    : 'bg-dark-800 text-dark-400'
                }`}
              >
                {amt}
              </button>
            ))}
            <button
              onClick={() => { telegram.hapticSelection(); setAmount(balance); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                amount === balance ? 'bg-orange-500 text-black' : 'bg-dark-800 text-dark-400'
              }`}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Potential Win */}
        {selectedOption && (
          <div className="bg-dark-800 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-dark-400">Potential Win</span>
                <p className="text-xs text-dark-500">After 10% platform fee</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-green-400">
                  +{formatNumber(potentialWin)} SATZ
                </span>
                <p className="text-xs text-dark-500">
                  {multiplier.toFixed(2)}x return
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit - TAP 2 */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting || amount > balance}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            selectedOption && !isSubmitting && amount <= balance
              ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black'
              : 'bg-dark-700 text-dark-500'
          }`}
        >
          {isSubmitting ? 'Placing...' : selectedOption ? `Predict ${amount} SATZ` : 'Select an option'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// MAIN HOMEPAGE COMPONENT
// ============================================

export default function HomePage() {
  const navigate = useNavigate();
  const { user, fetchUser } = useUserStore();
  const { dailyReward, fetchDailyReward, claimDailyReward } = useEarnStore();
  const { showToast, showCelebration } = useUIStore();
  
  const [hotQuests, setHotQuests] = useState([]);
  const [tapStats, setTapStats] = useState(null);
  const [quickPredictQuest, setQuickPredictQuest] = useState(null);
  const [friendNotification, setFriendNotification] = useState(null);
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  const isElite = user?.is_elite || user?.is_premium;
  const balance = Number(user?.satz_balance) || 0;
  const currentStreak = Number(user?.current_streak) || 0;
  
  // Get latest badge for avatar
  const latestBadge = useMemo(() => getLatestBadge(user, isElite), [user, isElite]);

  useEffect(() => { 
    loadData(); 
    // Check for friend earnings notifications
    checkFriendNotifications();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchUser(),
        fetchDailyReward()
      ]);
      
      const [questsRes, tapRes] = await Promise.allSettled([
        api.get('/api/miniapp/quests', { limit: 10, status: 'active' }),
        api.get('/api/miniapp/tap/status')
      ]);
      
      if (questsRes.status === 'fulfilled') {
        const quests = questsRes.value?.quests || [];
        const active = quests.filter(q => !q.betting_deadline || new Date(q.betting_deadline) > new Date());
        const sorted = active.sort((a, b) => {
          const poolA = (Number(a.pool_a) || 0) + (Number(a.pool_b) || 0);
          const poolB = (Number(b.pool_a) || 0) + (Number(b.pool_b) || 0);
          return poolB - poolA;
        });
        setHotQuests(sorted.slice(0, 3));
      }
      if (tapRes.status === 'fulfilled') setTapStats(tapRes.value);
    } catch (e) { console.error(e); }
  };

  const checkFriendNotifications = async () => {
    try {
      const data = await api.get('/api/miniapp/referral/notifications');
      if (data?.notification) {
        setFriendNotification(data.notification);
      }
    } catch (e) {
      // Silently fail
    }
  };

  // DAILY CLAIM HANDLER
  const handleClaimDaily = async () => {
    if (!dailyReward?.canClaim || isClaimingDaily) return;
    setIsClaimingDaily(true);
    telegram.hapticImpact('medium');
    
    try {
      const result = await claimDailyReward();
      
      // Store result and show celebration modal
      setClaimResult(result);
      setShowClaimSuccess(true);
      
      // Also show confetti via celebration system
        
      await fetchUser();
      await fetchDailyReward();
    } catch (error) {
      showToast(error.message || 'Failed to claim reward', 'error');
    } finally {
      setIsClaimingDaily(false);
    }
  };

  // Quick predict handler
  const handleQuickPredict = (quest) => {
    telegram.hapticSelection();
    setQuickPredictQuest(quest);
  };

  const miningProgress = tapStats ? Math.min(((tapStats.dailyMined || tapStats.minedToday || 0) / (tapStats.dailyCap || 100)) * 100, 100) : 0;
  const hotQuest = hotQuests[0];
  const timeInfo = hotQuest ? getTimeInfo(hotQuest.betting_deadline) : { text: '', urgent: false };

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Daily Claim Success Modal */}
      {showClaimSuccess && (
        <DailyClaimModal
          isOpen={showClaimSuccess}
          onClose={() => setShowClaimSuccess(false)}
          claimResult={claimResult}
        />
      )}

      {/* Friend Earnings Notification */}
      <AnimatePresence>
        {friendNotification && (
          <FriendEarningsNotification 
            notification={friendNotification} 
            onDismiss={() => setFriendNotification(null)} 
          />
        )}
      </AnimatePresence>

      {/* Quick Predict Modal */}
      <AnimatePresence>
        {quickPredictQuest && (
          <QuickPredictModal 
            quest={quickPredictQuest} 
            onClose={() => setQuickPredictQuest(null)}
            onPredict={() => { fetchUser(); loadData(); }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-b from-dark-900 to-dark-950 px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          {/* Profile with Badge Avatar */}
          <Link to="/profile" className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ 
                  backgroundColor: latestBadge.color + '30', 
                  border: '2px solid ' + latestBadge.color
                }}
              >
                {latestBadge.emoji}
              </div>
              {isElite && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown size={10} className="text-black" />
                </div>
              )}
            </div>
            <div className="text-left">
              <h1 className="text-base font-bold text-white">{user?.first_name || 'Player'}</h1>
              {currentStreak > 0 ? (
                <div className="flex items-center gap-1 text-orange-400 text-xs">
                  <Flame size={12} />
                  <span>{currentStreak} day streak</span>
                </div>
              ) : (
                <span 
                  className="text-xs px-1.5 py-0.5 rounded" 
                  style={{ backgroundColor: latestBadge.color + '20', color: latestBadge.color }}
                >
                  {latestBadge.emoji} {latestBadge.name}
                </span>
              )}
            </div>
          </Link>
          
          {/* Balance */}
          <Link to="/wallet">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{formatExact(balance)}</p>
              <p className="text-xs text-dark-500">SATZ</p>
            </div>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-dark-800/50 rounded-xl p-3 text-center border border-white/5">
            <p className="text-lg font-bold text-white">{user?.predictions_won || 0}</p>
            <p className="text-[10px] text-dark-500">Wins</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-3 text-center border border-white/5">
            <p className="text-lg font-bold text-white">{(user?.win_rate || 0).toFixed(0)}%</p>
            <p className="text-[10px] text-dark-500">Win Rate</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-3 text-center border border-white/5">
            <p className="text-lg font-bold text-green-400">{formatNumber(user?.total_won || 0)}</p>
            <p className="text-[10px] text-dark-500">Won</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-4">
        {/* DAILY CLAIM BUTTON - RESTORED */}
        {dailyReward?.canClaim && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Gift size={24} className="text-black" />
                </motion.div>
                <div>
                  <p className="font-bold text-white">Daily Reward Ready!</p>
                  <p className="text-xs text-yellow-400">
                    +{formatNumber(dailyReward.streakReward || 100)} SATZ
                    {dailyReward.currentStreak > 0 && ` • ${dailyReward.currentStreak} day streak`}
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClaimDaily}
                disabled={isClaimingDaily}
                className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-black"
              >
                {isClaimingDaily ? '...' : 'Claim'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* LUCKY HOUR BANNER */}
        <LuckyHourBanner />

        {/* Continuous Activity Feed */}
        <ContinuousActivityFeed />
        
        {/* Elite Upgrade Banner */}
        {!isElite && (
          <Link to="/premium" className="block mb-4">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3 flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">Upgrade to Elite - Create pools & earn 5%</span>
            </div>
          </Link>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { to: '/mine', icon: Zap, label: 'Mine', gradient: 'from-orange-500 to-yellow-500' },
            { to: '/pools', icon: Target, label: 'Pools', gradient: 'from-purple-500 to-pink-500' },
            { to: '/friends', icon: Users, label: 'Invite', gradient: 'from-blue-500 to-cyan-500', badge: '+250' },
            { to: '/leaderboard', icon: Trophy, label: 'Ranks', gradient: 'from-yellow-500 to-orange-500' },
          ].map((item) => (
            <Link key={item.to} to={item.to}>
              <motion.div 
                whileTap={{ scale: 0.95 }} 
                className="relative bg-dark-800 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2"
              >
                {item.badge && (
                  <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-green-500 rounded-md text-[9px] font-bold text-black">
                    {item.badge}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                  <item.icon size={20} className="text-white" />
                </div>
                <span className="text-[11px] font-medium text-gray-300">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* DAILY JACKPOT */}
        <DailyJackpotCard />

        {/* Mining Progress */}
        {tapStats && (
          <Link to="/mine" className="block mb-4">
            <div className="bg-dark-800 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-orange-400" />
                  <span className="text-sm font-medium text-white">Today's Mining</span>
                </div>
                <span className="text-xs text-dark-400">
                  {(tapStats.dailyMined || tapStats.minedToday || 0).toFixed(0)}/{tapStats.dailyCap || 100}
                </span>
              </div>
              <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-500" 
                  initial={{ width: 0 }}
                  animate={{ width: `${miningProgress}%` }} 
                />
              </div>
            </div>
          </Link>
        )}

        {/* HOT PREDICTIONS - 2-TAP ENABLED */}
        {hotQuests.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Target size={14} className="text-orange-400" />
                🔥 Hot Predictions
              </h2>
              <Link to="/pools" className="text-xs text-orange-400 flex items-center">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            
            {/* Urgency Banner */}
            {timeInfo.urgent && hotQuest && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-2 mb-2 flex items-center justify-center gap-2">
                <AlertCircle size={14} className="text-red-400" />
                <span className="text-xs text-red-400 font-medium">Closing soon! {timeInfo.text}</span>
              </div>
            )}
            
            {/* Quest Cards with Quick Predict */}
            <div className="space-y-3">
              {hotQuests.map((quest, index) => {
                const poolA = Number(quest.pool_a) || 0;
                const poolB = Number(quest.pool_b) || 0;
                const total = poolA + poolB;
                const oddsA = total > 0 ? Math.round((poolA / total) * 100) : 50;
                const questTimeInfo = getTimeInfo(quest.betting_deadline);
                const earlyBird = isEarlyBird(quest);
                
                return (
                  <motion.div 
                    key={quest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-dark-800 border border-white/5 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] flex items-center gap-0.5">
                          <Bot size={8} /> Auto
                        </span>
                        {earlyBird && (
                          <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-[9px]">
                            🐦 +50%
                          </span>
                        )}
                        {isLuckyHour() && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[9px]">
                            ⚡ 2x
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] flex items-center gap-0.5 ${
                        questTimeInfo.urgent ? 'bg-red-500/20 text-red-400' : 'bg-dark-700 text-dark-400'
                      }`}>
                        <Clock size={10} />{questTimeInfo.text}
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-medium text-white mb-3 line-clamp-2">{quest.title}</h3>
                    
                    <div className="flex items-center gap-3 text-[10px] text-dark-500 mb-3">
                      <span className="flex items-center gap-0.5">
                        <Users size={10} /> {quest.participant_count || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <TrendingUp size={10} /> {formatNumber(total)} pool
                      </span>
                    </div>
                    
                    {/* Odds Bar */}
                    <div className="space-y-1.5 mb-3">
                      <div className="h-2 bg-dark-700 rounded-full overflow-hidden flex">
                        <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${oddsA}%` }} />
                        <div className="h-full bg-gradient-to-r from-red-400 to-red-500" style={{ width: `${100 - oddsA}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-green-400">{quest.option_a || 'Yes'} {oddsA}%</span>
                        <span className="text-red-400">{quest.option_b || 'No'} {100 - oddsA}%</span>
                      </div>
                    </div>
                    
                    {/* Quick Predict Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickPredict(quest)}
                      className="w-full py-2.5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-xl"
                    >
                      <span className="text-xs text-orange-400 font-bold">🎯 Quick Predict</span>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Invite Friends Banner */}
        <Link to="/friends">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Users size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Invite Friends & Earn</p>
                  <p className="text-xs text-dark-400">250 SATZ + 5% of their earnings</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-blue-400" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
