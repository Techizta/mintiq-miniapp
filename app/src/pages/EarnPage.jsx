/**
 * MintIQ EarnPage - Simplified Stable Version
 * Daily streak, spin wheel, tasks
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Flame, 
  ChevronRight, 
  Check, 
  Zap,
  Users,
  Star,
  Sparkles
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useEarnStore } from '../stores/earnStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';

const STREAK_REWARDS = { 1: 10, 2: 15, 3: 25, 4: 35, 5: 50, 6: 75, 7: 150 };

const WHEEL_SEGMENTS = [
  { value: 1, color: '#06B6D4' },
  { value: 5, color: '#8B5CF6' },
  { value: 2, color: '#EC4899' },
  { value: 10, color: '#F59E0B' },
  { value: 3, color: '#3B82F6' },
  { value: 25, color: '#10B981' },
  { value: 7, color: '#EF4444' },
  { value: 50, color: '#FFD700' },
];

// Simple Spin Wheel Component
function SpinWheel({ onSpin, isSpinning, result, canSpin }) {
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  useEffect(() => {
    if (result && isSpinning) {
      const segmentIndex = WHEEL_SEGMENTS.findIndex(s => s.value === result.amount);
      const targetIndex = segmentIndex >= 0 ? segmentIndex : 0;
      const targetRotation = 360 * 5 + (360 - (targetIndex * segmentAngle + segmentAngle / 2));
      setRotation(targetRotation);
      setTimeout(() => setShowResult(true), 3500);
    }
  }, [result, isSpinning]);

  const handleSpin = () => {
    if (!canSpin || isSpinning) return;
    setShowResult(false);
    onSpin();
  };

  // Build conic-gradient string
  const gradientStops = WHEEL_SEGMENTS.map((seg, i) => 
    `${seg.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
  ).join(', ');

  return (
    <div className="flex flex-col items-center">
      {/* Pointer */}
      <div className="relative z-10 mb-[-10px]">
        <div 
          className="w-0 h-0"
          style={{
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '20px solid #FBBF24'
          }}
        />
      </div>

      {/* Wheel Container */}
      <div className="relative w-56 h-56">
        {/* Outer glow */}
        <div className="absolute inset-[-4px] rounded-full bg-yellow-500/20 blur-md" />
        
        {/* Outer border */}
        <div className="absolute inset-0 rounded-full border-4 border-yellow-500/50" />
        
        {/* Spinning wheel */}
        <motion.div
          className="w-full h-full rounded-full relative overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 3.5, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ background: `conic-gradient(${gradientStops})` }}
        >
          {/* Segment labels */}
          {WHEEL_SEGMENTS.map((segment, i) => {
            const angle = i * segmentAngle + segmentAngle / 2;
            const rad = (angle - 90) * (Math.PI / 180);
            const x = 50 + 35 * Math.cos(rad);
            const y = 50 + 35 * Math.sin(rad);
            return (
              <div
                key={i}
                className="absolute text-white font-bold text-sm drop-shadow"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {segment.value}
              </div>
            );
          })}
        </motion.div>

        {/* Center button */}
        <button
          onClick={handleSpin}
          disabled={!canSpin || isSpinning}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full z-20 flex items-center justify-center font-bold text-sm"
          style={{
            background: canSpin && !isSpinning 
              ? 'linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)'
              : '#374151',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {isSpinning ? (
            <Sparkles size={20} className="text-white animate-spin" />
          ) : canSpin ? (
            <span className="text-gray-900">SPIN</span>
          ) : (
            <Check size={20} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center w-full"
          >
            <p className="text-2xl font-bold text-yellow-400">🎉 +{result.amount} SATZ</p>
            <p className="text-sm text-dark-400 mt-1">Added to balance!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EarnPage() {
  const { user, fetchUser } = useUserStore();
  const { dailyReward, fetchDailyReward, claimDailyReward, tasks, fetchTasks } = useEarnStore();
  const { showToast } = useUIStore();
  
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [spinResult, setSpinResult] = useState(null);

  useEffect(() => {
    fetchDailyReward();
    fetchTasks();
    checkSpinStatus();
  }, []);

  const checkSpinStatus = async () => {
    try {
      const response = await api.get('/api/miniapp/earn/spin/status');
      setCanSpin(response?.canSpin !== false);
    } catch (e) { 
      setCanSpin(true); 
    }
  };

  const currentStreak = Number(dailyReward?.currentStreak) || 0;
  const streakReward = dailyReward?.streakReward || STREAK_REWARDS[Math.min(currentStreak + 1, 7)] || 10;

  const handleClaimDaily = async () => {
    if (!dailyReward?.canClaim || isClaimingDaily) return;
    telegram.hapticImpact('medium');
    setIsClaimingDaily(true);
    try {
      const result = await claimDailyReward();
      telegram.hapticNotification('success');
      showToast(`🎉 Claimed ${result?.reward || streakReward} SATZ!`, 'success');
      fetchUser(true);
      fetchDailyReward();
    } catch (error) { 
      showToast(error.message || 'Failed to claim', 'error'); 
    } finally { 
      setIsClaimingDaily(false); 
    }
  };

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;
    telegram.hapticImpact('medium');
    setIsSpinning(true);
    setSpinResult(null);
    
    try {
      const response = await api.post('/api/miniapp/earn/spin');
      const reward = response?.reward || response?.amount || WHEEL_SEGMENTS[Math.floor(Math.random() * WHEEL_SEGMENTS.length)].value;
      setSpinResult({ amount: reward });
      setTimeout(() => {
        setCanSpin(false);
        setIsSpinning(false);
        fetchUser(true);
        telegram.hapticNotification('success');
      }, 4000);
    } catch (error) {
      showToast(error.message || 'Spin failed', 'error');
      setIsSpinning(false);
    }
  };

  const handleTaskStart = async (task) => {
    telegram.hapticSelection();
    if (task.task_type === 'channel_join' && task.target_channel) {
      telegram.openTelegramLink(task.target_channel);
    } else if (task.target_url) {
      telegram.openLink(task.target_url);
    }
  };

  const incompleteTasks = (tasks || []).filter(t => !t.completed);

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4">
        <h1 className="text-xl font-bold text-white">Earn SATZ</h1>
        <p className="text-sm text-dark-400">Spin, claim & complete tasks</p>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Spin Wheel */}
        <div className="bg-dark-800 rounded-2xl p-5 border border-white/5">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <Star className="text-yellow-400" size={20} />
              Daily Spin
            </h2>
            <p className="text-sm text-dark-400">
              {canSpin ? 'Spin to win up to 50 SATZ!' : 'Come back tomorrow!'}
            </p>
          </div>
          <SpinWheel 
            onSpin={handleSpin} 
            isSpinning={isSpinning} 
            result={spinResult} 
            canSpin={canSpin && !isSpinning} 
          />
        </div>

        {/* Daily Streak */}
        <div className={`rounded-2xl p-4 ${
          dailyReward?.canClaim 
            ? 'bg-orange-500/20 border border-orange-500/30' 
            : 'bg-dark-800 border border-white/5'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              dailyReward?.canClaim ? 'bg-orange-500' : 'bg-dark-700'
            }`}>
              <Gift size={24} className={dailyReward?.canClaim ? 'text-white' : 'text-dark-400'} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-white">Daily Streak</h2>
              <p className="text-sm text-dark-400">
                {dailyReward?.canClaim ? `Claim ${streakReward} SATZ!` : 'Come back tomorrow!'}
              </p>
            </div>
            <button
              onClick={handleClaimDaily}
              disabled={!dailyReward?.canClaim || isClaimingDaily}
              className={`px-4 py-2 rounded-xl font-semibold ${
                dailyReward?.canClaim 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-dark-700 text-dark-400'
              }`}
            >
              {isClaimingDaily ? '...' : dailyReward?.canClaim ? 'Claim' : 'Done ✓'}
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Flame size={14} className="text-orange-500" />
            <span className="text-sm text-white font-medium">{currentStreak} Day Streak</span>
          </div>
          
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div 
                key={day} 
                className={`flex-1 h-2 rounded-full ${
                  day <= currentStreak 
                    ? 'bg-orange-500' 
                    : day === currentStreak + 1 && dailyReward?.canClaim 
                    ? 'bg-orange-500/30 animate-pulse' 
                    : 'bg-dark-700'
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/friends" className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <Users size={20} className="text-blue-400 mb-2" />
            <h3 className="font-semibold text-white text-sm">Invite Friends</h3>
            <p className="text-xs text-dark-400">Earn 7% forever</p>
          </Link>
          <Link to="/boosters" className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <Zap size={20} className="text-purple-400 mb-2" />
            <h3 className="font-semibold text-white text-sm">Boosters</h3>
            <p className="text-xs text-dark-400">Multiply rewards</p>
          </Link>
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Tasks</h2>
            <Link to="/earn/tasks" className="text-mint-400 text-xs flex items-center">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {incompleteTasks.length === 0 ? (
              <div className="text-center py-8 bg-dark-800 rounded-xl">
                <Sparkles size={32} className="mx-auto mb-2 text-dark-600" />
                <p className="text-dark-400 text-sm">All tasks completed!</p>
              </div>
            ) : (
              incompleteTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskStart(task)}
                  className="bg-dark-800 rounded-xl p-4 border border-white/5 flex items-center gap-3 cursor-pointer active:scale-98"
                >
                  <div className="w-10 h-10 bg-mint-500/20 rounded-xl flex items-center justify-center text-lg">
                    {task.task_type === 'channel_join' ? '📢' : '🌐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm truncate">{task.name}</h3>
                    <p className="text-xs text-dark-400 truncate">{task.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-mint-400">+{formatSatz(task.user_reward_satz || task.reward_satz || 0)}</p>
                    <p className="text-xs text-dark-500">SATZ</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
