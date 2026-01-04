/**
 * DailyClaimModal - Celebration modal after claiming daily reward
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Flame, Star, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Confetti particle component
function Confetti({ count = 50 }) {
  const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: 500,
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Daily rewards by streak day
const DAILY_REWARDS = [
  { day: 1, reward: 100 },
  { day: 2, reward: 120 },
  { day: 3, reward: 140 },
  { day: 4, reward: 160 },
  { day: 5, reward: 180 },
  { day: 6, reward: 200 },
  { day: 7, reward: 250 },
];

export default function DailyClaimModal({ isOpen, onClose, claimResult }) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const streak = claimResult?.streak || 1;
  const reward = claimResult?.satsEarned || claimResult?.reward || 100;
  const nextReward = claimResult?.nextReward || DAILY_REWARDS[Math.min(streak, 6)]?.reward || 120;
  const newBalance = claimResult?.newBalance;
  
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Stop confetti after animation
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Confetti */}
        {showConfetti && <Confetti count={60} />}
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-dark-900 rounded-3xl w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header with glow */}
          <div className="relative bg-gradient-to-b from-yellow-500/20 to-transparent pt-8 pb-4 px-6 text-center">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-dark-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            {/* Animated gift icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30"
            >
              <Gift size={40} className="text-black" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-1"
            >
              Reward Claimed! 🎉
            </motion.h2>
          </div>
          
          {/* Reward amount */}
          <div className="px-6 py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center mb-4"
            >
              <p className="text-dark-400 text-sm mb-1">You earned</p>
              <p className="text-4xl font-bold text-white mb-1">
                +{reward} <span className="text-xl text-orange-400">SATZ</span>
              </p>
              {newBalance && (
                <p className="text-xs text-dark-500">
                  New balance: {newBalance.toLocaleString()} SATZ
                </p>
              )}
            </motion.div>
            
            {/* Streak info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-dark-800 rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-orange-500" />
                  <span className="font-medium text-white">{streak} Day Streak!</span>
                </div>
                {streak < 7 && (
                  <span className="text-xs text-dark-400">{7 - streak} days to max</span>
                )}
              </div>
              
              {/* Streak progress bar */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <div 
                    key={day}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      day <= streak ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-dark-700'
                    }`}
                  />
                ))}
              </div>
              
              {/* Next reward preview */}
              {streak < 7 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-400">Tomorrow's reward:</span>
                  <span className="text-green-400 font-medium">+{nextReward} SATZ</span>
                </div>
              )}
              
              {streak >= 7 && (
                <div className="flex items-center gap-2 text-sm text-gold-400">
                  <Star size={14} />
                  <span>Maximum streak bonus active!</span>
                </div>
              )}
            </motion.div>
            
            {/* Warning message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4"
            >
              <p className="text-xs text-red-400 text-center">
                ⚠️ Don't forget to claim tomorrow or you'll lose your streak!
              </p>
            </motion.div>
            
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-black"
            >
              Awesome!
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
