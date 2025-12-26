/**
 * MintIQ Shared UI Components
 * Phase 2: Value Clarity + Phase 3: Gamification
 */

import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Gift, Trophy, ChevronRight, Info } from 'lucide-react';
import { formatSatz, satzUsdValue, formatSatzWithUsd, getWithdrawalProgress, formatToMilestone, formatRelativeTime } from '../../utils/helpers';

// ============================================
// SATZ VALUE DISPLAY
// Shows SATZ with USD value
// ============================================

export function SatzValue({ amount, size = 'md', showUsd = true, className = '' }) {
  const satz = Number(amount) || 0;
  const usd = satzUsdValue(satz);
  
  const sizes = {
    sm: { satz: 'text-sm font-semibold', usd: 'text-xs' },
    md: { satz: 'text-lg font-bold', usd: 'text-sm' },
    lg: { satz: 'text-2xl font-black', usd: 'text-base' },
    xl: { satz: 'text-3xl font-black', usd: 'text-lg' },
  };
  
  const s = sizes[size] || sizes.md;
  
  return (
    <div className={`flex items-baseline gap-1.5 ${className}`}>
      <span className={`${s.satz} text-gradient-gold`}>
        {formatSatz(satz)} <span className="text-gold-400/80 font-medium">SATZ</span>
      </span>
      {showUsd && (
        <span className={`${s.usd} text-dark-400`}>
          ({usd})
        </span>
      )}
    </div>
  );
}

// ============================================
// WITHDRAWAL PROGRESS BAR
// Shows progress to 50K SATZ minimum
// ============================================

export function WithdrawalProgress({ balance, showMilestone = true, compact = false }) {
  const progress = getWithdrawalProgress(balance);
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-mint-500 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-dark-400 whitespace-nowrap">
          {progress.canWithdraw ? '✓ Ready!' : `${progress.percentage.toFixed(0)}%`}
        </span>
      </div>
    );
  }
  
  return (
    <div className="bg-dark-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-dark-400">Progress to Withdrawal</span>
        <span className="text-sm font-medium text-white">
          {formatSatz(progress.current)} / {formatSatz(progress.target)}
        </span>
      </div>
      
      <div className="h-3 bg-dark-700 rounded-full overflow-hidden mb-2">
        <motion.div
          className={`h-full rounded-full ${
            progress.canWithdraw 
              ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
              : 'bg-gradient-to-r from-mint-500 to-cyan-400'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      
      {showMilestone && (
        <p className="text-xs text-center">
          {progress.canWithdraw ? (
            <span className="text-green-400 font-medium">🎉 Ready to withdraw Bitcoin!</span>
          ) : (
            <span className="text-dark-400">
              {formatToMilestone(progress.current)}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

// ============================================
// LIVE ACTIVITY FEED
// Social proof - shows recent wins
// ============================================

export function LiveActivityFeed({ activities = [], className = '' }) {
  if (!activities.length) return null;
  
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex gap-4"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {[...activities, ...activities].map((activity, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-dark-800/50 rounded-full px-3 py-1.5 whitespace-nowrap"
          >
            <span className="text-sm">
              {activity.type === 'win' && '🏆'}
              {activity.type === 'earn' && '💰'}
              {activity.type === 'prediction' && '🎯'}
            </span>
            <span className="text-xs text-dark-300">
              <span className="text-white font-medium">{activity.name}</span>
              {' '}{activity.action}{' '}
              <span className="text-gold-400 font-semibold">+{formatSatz(activity.amount)}</span>
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ============================================
// QUICK ACTION CARD
// Compact action button with icon
// ============================================

export function QuickActionCard({ icon: Icon, label, sublabel, onClick, badge, variant = 'default' }) {
  const variants = {
    default: 'bg-dark-800 hover:bg-dark-750',
    primary: 'bg-mint-500/20 hover:bg-mint-500/30 border border-mint-500/30',
    gold: 'bg-gold-gradient',
    danger: 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30',
  };
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex items-center gap-3 p-3 rounded-xl transition-colors ${variants[variant]}`}
    >
      {badge && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 rounded-full text-2xs font-bold text-white">
          {badge}
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        variant === 'gold' ? 'bg-dark-900/30' : 'bg-white/10'
      }`}>
        <Icon size={20} className={variant === 'gold' ? 'text-dark-900' : 'text-white'} />
      </div>
      <div className="flex-1 text-left">
        <p className={`font-semibold text-sm ${variant === 'gold' ? 'text-dark-900' : 'text-white'}`}>
          {label}
        </p>
        {sublabel && (
          <p className={`text-xs ${variant === 'gold' ? 'text-dark-900/70' : 'text-dark-400'}`}>
            {sublabel}
          </p>
        )}
      </div>
      <ChevronRight size={16} className={variant === 'gold' ? 'text-dark-900/50' : 'text-dark-500'} />
    </motion.button>
  );
}

// ============================================
// STREAK DISPLAY
// Shows current streak with multiplier
// ============================================

export function StreakDisplay({ streak, compact = false }) {
  const currentStreak = Number(streak) || 0;
  const multiplier = currentStreak >= 7 ? 1.2 : currentStreak >= 3 ? 1.1 : 1.0;
  
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-orange-400">
        <span className="text-lg">🔥</span>
        <span className="font-bold">{currentStreak}</span>
        {multiplier > 1 && (
          <span className="text-xs bg-orange-500/20 px-1.5 py-0.5 rounded-full">
            {multiplier}x
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
        <span className="text-2xl">🔥</span>
      </div>
      <div className="flex-1">
        <p className="text-white font-semibold">{currentStreak} Day Streak</p>
        {multiplier > 1 && (
          <p className="text-xs text-orange-400">
            <Zap size={12} className="inline mr-1" />
            {multiplier}x bonus active!
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// FEATURED PREDICTION CARD
// Large, prominent prediction display
// ============================================

export function FeaturedPredictionCard({ quest, onPredict, userBalance = 0 }) {
  if (!quest) return null;
  
  const poolA = Number(quest.pool_a) || 0;
  const poolB = Number(quest.pool_b) || 0;
  const total = poolA + poolB;
  const oddsA = total > 0 ? Math.round((poolA / total) * 100) : 50;
  const oddsB = 100 - oddsA;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-white/10"
    >
      {/* Hot badge */}
      <div className="absolute top-3 right-3 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
        <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
          <Zap size={12} /> HOT
        </span>
      </div>
      
      <div className="p-4">
        {/* Category & Time */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-mint-500/20 text-mint-400 rounded-full text-xs font-medium capitalize">
            {quest.category || 'crypto'}
          </span>
          <span className="text-xs text-dark-400">
            ⏰ Ends in {formatRelativeTime(quest.betting_deadline)}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-4 leading-tight">
          {quest.title}
        </h3>
        
        {/* Options - Large buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onPredict?.(quest.id, 'a')}
            className="relative p-4 rounded-xl bg-mint-500/10 border-2 border-mint-500/30 hover:border-mint-500 transition-colors"
          >
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-mint-500 rounded text-xs font-bold text-dark-900">
              {oddsA}%
            </div>
            <p className="text-white font-semibold text-sm mb-1">{quest.option_a || 'Yes'}</p>
            <p className="text-xs text-dark-400">{formatSatz(poolA)} SATZ</p>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onPredict?.(quest.id, 'b')}
            className="relative p-4 rounded-xl bg-red-500/10 border-2 border-red-500/30 hover:border-red-500 transition-colors"
          >
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-500 rounded text-xs font-bold text-white">
              {oddsB}%
            </div>
            <p className="text-white font-semibold text-sm mb-1">{quest.option_b || 'No'}</p>
            <p className="text-xs text-dark-400">{formatSatz(poolB)} SATZ</p>
          </motion.button>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-dark-400 pt-3 border-t border-white/5">
          <span className="flex items-center gap-1">
            <TrendingUp size={12} className="text-gold-400" />
            {formatSatz(total)} pool
          </span>
          <span>👥 {quest.participant_count || 0} players</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// FIRST TIME BONUS CARD
// Shows first-time action bonuses
// ============================================

export function FirstTimeBonusCard({ type, amount, claimed = false, onClaim }) {
  const bonuses = {
    prediction: { icon: '🎯', title: 'First Prediction', subtitle: 'Make your first prediction' },
    task: { icon: '📋', title: 'First Task', subtitle: 'Complete your first task' },
    referral: { icon: '👥', title: 'First Referral', subtitle: 'Invite a friend' },
    daily: { icon: '📅', title: 'Daily Reward', subtitle: 'Claim your daily bonus' },
  };
  
  const bonus = bonuses[type] || bonuses.prediction;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-xl border ${
        claimed 
          ? 'bg-dark-800/50 border-dark-700' 
          : 'bg-gradient-to-r from-gold-500/10 to-orange-500/10 border-gold-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          claimed ? 'bg-dark-700' : 'bg-gold-500/20'
        }`}>
          {claimed ? '✓' : bonus.icon}
        </div>
        <div className="flex-1">
          <p className={`font-semibold ${claimed ? 'text-dark-400' : 'text-white'}`}>
            {bonus.title}
          </p>
          <p className="text-xs text-dark-400">{bonus.subtitle}</p>
        </div>
        <div className="text-right">
          <p className={`font-bold ${claimed ? 'text-dark-500' : 'text-gold-400'}`}>
            +{formatSatz(amount)}
          </p>
          {!claimed && onClaim && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClaim}
              className="mt-1 px-3 py-1 bg-gold-gradient rounded-lg text-xs font-semibold text-dark-900"
            >
              Claim
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// SATZ TOOLTIP
// Explains what SATZ is worth
// ============================================

export function SatzTooltip({ trigger }) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-dark-400 hover:text-white transition-colors"
      >
        {trigger || <Info size={14} />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-dark-800 border border-white/10 rounded-xl shadow-xl z-50"
          >
            <p className="text-sm font-semibold text-white mb-1">What is SATZ?</p>
            <p className="text-xs text-dark-300 mb-2">
              1 SATZ = 1 satoshi = 0.00000001 BTC
            </p>
            <p className="text-xs text-dark-400">
              At current BTC price, 1,000 SATZ ≈ $1
            </p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-dark-800 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Need React for tooltip
import React from 'react';
