/**
 * MintIQ ProfilePage - COMPLETE VERSION
 * 
 * Features:
 * - Badge system with unlocking
 * - Latest badge display
 * - History with proper status/odds/ROI
 * - Settings tab
 * - Share badges functionality
 */

import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Bell, LogOut, ChevronRight, Crown, Trophy, Target, 
  Settings, History, Award, Users, Share2, Lock, X, Shield, Zap,
  TrendingUp, Star, Gift, Check
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';

// ============================================
// BADGES CONFIGURATION - EXPORTED
// ============================================

export const BADGES = [
  { id: 'newcomer', name: 'Newcomer', emoji: '🌱', desc: 'Welcome to MintIQ!', color: '#888888' },
  { id: 'first_win', name: 'First Blood', emoji: '🎯', desc: 'Win your first prediction', requirement: { wins: 1 }, color: '#10B981' },
  { id: 'streak_3', name: 'Hot Streak', emoji: '🔥', desc: '3 day login streak', requirement: { streak: 3 }, color: '#F59E0B' },
  { id: 'predictor_10', name: 'Predictor', emoji: '🔮', desc: 'Make 10 predictions', requirement: { predictions: 10 }, color: '#8B5CF6' },
  { id: 'winner_5', name: 'Lucky 5', emoji: '🍀', desc: 'Win 5 predictions', requirement: { wins: 5 }, color: '#22C55E' },
  { id: 'streak_7', name: 'Week Warrior', emoji: '⚔️', desc: '7 day login streak', requirement: { streak: 7 }, color: '#EF4444' },
  { id: 'predictor_50', name: 'Oracle', emoji: '🧙', desc: 'Make 50 predictions', requirement: { predictions: 50 }, color: '#6366F1' },
  { id: 'winner_25', name: 'High Roller', emoji: '🎰', desc: 'Win 25 predictions', requirement: { wins: 25 }, color: '#EC4899' },
  { id: 'whale', name: 'Whale', emoji: '🐋', desc: 'Win 10,000+ SATZ', requirement: { totalWon: 10000 }, color: '#0EA5E9' },
  { id: 'predictor_100', name: 'Grandmaster', emoji: '👑', desc: 'Make 100 predictions', requirement: { predictions: 100 }, color: '#FFD700' },
  { id: 'legend', name: 'Legend', emoji: '🏆', desc: '50+ wins, 60%+ rate', requirement: { wins: 50, winRate: 60 }, color: '#F97316' },
  { id: 'elite', name: 'Elite Member', emoji: '💎', desc: 'Upgrade to Elite', requirement: { elite: true }, color: '#A855F7' },
];

// Check if badge is unlocked
export const isBadgeUnlocked = (badge, user, isElite) => {
  if (!badge.requirement) return true; // Newcomer badge
  const req = badge.requirement;
  
  if (req.wins && (user?.predictions_won || 0) < req.wins) return false;
  if (req.predictions && (user?.predictions_made || 0) < req.predictions) return false;
  if (req.streak && (user?.current_streak || 0) < req.streak) return false;
  if (req.totalWon && (user?.total_won || 0) < req.totalWon) return false;
  if (req.winRate) {
    const userWinRate = user?.win_rate || 0;
    const userWins = user?.predictions_won || 0;
    if (userWinRate < req.winRate || userWins < (req.wins || 0)) return false;
  }
  if (req.elite && !isElite) return false;
  
  return true;
};

// Get the latest (highest) unlocked badge
export const getLatestBadge = (user, isElite) => {
  const unlocked = BADGES.filter(b => isBadgeUnlocked(b, user, isElite));
  return unlocked.length > 0 ? unlocked[unlocked.length - 1] : BADGES[0];
};

// ============================================
// BADGE MODAL COMPONENT
// ============================================

function BadgeModal({ badge, isUnlocked, onClose, onShare }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-dark-800 rounded-3xl p-6 max-w-sm w-full text-center border border-white/10 relative" 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-dark-400 hover:text-white">
          <X size={20} />
        </button>
        
        <div 
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl ${!isUnlocked && 'grayscale opacity-50'}`} 
          style={{ backgroundColor: badge.color + '20' }}
        >
          {isUnlocked ? badge.emoji : '🔒'}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">{badge.name}</h2>
        <p className="text-dark-400 mb-6">{badge.desc}</p>
        
        {isUnlocked ? (
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={onShare} 
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl font-bold text-black flex items-center justify-center gap-2"
          >
            <Share2 size={18} /> Share Badge
          </motion.button>
        ) : (
          <div className="py-3 bg-dark-700 rounded-xl text-dark-400 font-medium flex items-center justify-center gap-2">
            <Lock size={16} /> Locked
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ============================================
// MAIN PROFILE PAGE
// ============================================

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, fetchUser } = useUserStore();
  const { showToast } = useUIStore();
  
  const [activeTab, setActiveTab] = useState('settings');
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  
  const isElite = user?.is_elite || user?.is_premium;
  const latestBadge = useMemo(() => getLatestBadge(user, isElite), [user, isElite]);
  const unlockedBadges = useMemo(() => BADGES.filter(b => isBadgeUnlocked(b, user, isElite)), [user, isElite]);
  const lockedBadges = useMemo(() => BADGES.filter(b => !isBadgeUnlocked(b, user, isElite)), [user, isElite]);

  useEffect(() => { 
    if (activeTab === 'history') loadPredictions(); 
  }, [activeTab]);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      // Try multiple endpoints
      const endpoints = ['/api/miniapp/user/bets', '/api/miniapp/bets', '/api/miniapp/predictions'];
      let result = null;
      
      for (const ep of endpoints) {
        try { 
          result = await api.get(ep, { limit: 50 }); 
          if (result?.bets?.length || result?.predictions?.length) break; 
        } catch {}
      }
      
      setPredictions(result?.bets || result?.predictions || []);
    } catch (e) {
      console.error('Failed to load predictions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => { 
    telegram.hapticImpact('medium'); 
    try { 
      await logout(); 
      navigate('/'); 
    } catch { 
      showToast('Logout failed', 'error'); 
    } 
  };

  const toggleNotifications = () => { 
    telegram.hapticSelection(); 
    setNotifications(!notifications); 
    showToast(notifications ? 'Notifications disabled' : 'Notifications enabled', 'success'); 
  };

  const handleShareBadge = (badge) => { 
    telegram.shareUrl(
      'https://t.me/MintIQBot', 
      `🏆 I earned the "${badge.name}" ${badge.emoji} badge on MintIQ! Join and start predicting!`
    ); 
    setSelectedBadge(null); 
  };

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Badge Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeModal 
            badge={selectedBadge.badge} 
            isUnlocked={selectedBadge.unlocked} 
            onClose={() => setSelectedBadge(null)} 
            onShare={() => handleShareBadge(selectedBadge.badge)} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="px-4 pt-4">
        <div className="bg-dark-800 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar with Badge */}
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" 
                style={{ 
                  backgroundColor: latestBadge.color + '30', 
                  border: `3px solid ${latestBadge.color}` 
                }}
              >
                {latestBadge.emoji}
              </div>
              {isElite && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown size={12} className="text-black" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user?.first_name || 'Player'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="text-xs px-2.5 py-1 rounded-full font-medium" 
                  style={{ backgroundColor: latestBadge.color + '20', color: latestBadge.color }}
                >
                  {latestBadge.emoji} {latestBadge.name}
                </span>
                <span className="text-xs text-dark-400">• {unlockedBadges.length} badges</span>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{user?.predictions_made || 0}</p>
              <p className="text-xs text-dark-400">Predictions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{user?.predictions_won || 0}</p>
              <p className="text-xs text-dark-400">Wins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{(user?.win_rate || 0).toFixed(0)}%</p>
              <p className="text-xs text-dark-400">Win Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 pt-4">
        <div className="flex gap-2">
          {[
            { id: 'settings', label: 'Settings', icon: Settings }, 
            { id: 'badges', label: 'Badges', icon: Award }, 
            { id: 'history', label: 'History', icon: History }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { telegram.hapticSelection(); setActiveTab(tab.id); }} 
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === tab.id 
                  ? 'bg-orange-500 text-black' 
                  : 'bg-dark-800 text-dark-400'
              }`}
            >
              <tab.icon size={14} />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pt-4">
        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            {/* Elite Upgrade */}
            {!isElite && (
              <Link to="/premium">
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
                  <Crown size={22} className="text-yellow-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">Upgrade to Elite</p>
                    <p className="text-xs text-dark-400">Create pools, 2x mining, exclusive badges</p>
                  </div>
                  <ChevronRight size={20} className="text-yellow-400" />
                </div>
              </Link>
            )}
            
            {/* Menu Items */}
            <div className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
              <Link to="/leaderboard" className="flex items-center gap-3 p-4">
                <Trophy size={20} className="text-yellow-400" />
                <span className="flex-1 text-white">Leaderboard</span>
                <ChevronRight size={18} className="text-dark-400" />
              </Link>
              
              <Link to="/friends" className="flex items-center gap-3 p-4">
                <Users size={20} className="text-blue-400" />
                <span className="flex-1 text-white">Referrals</span>
                <ChevronRight size={18} className="text-dark-400" />
              </Link>
              
              <Link to="/wallet" className="flex items-center gap-3 p-4">
                <TrendingUp size={20} className="text-green-400" />
                <span className="flex-1 text-white">Wallet & Transactions</span>
                <ChevronRight size={18} className="text-dark-400" />
              </Link>
              
              <button onClick={toggleNotifications} className="w-full flex items-center gap-3 p-4">
                <Bell size={20} className="text-dark-400" />
                <span className="flex-1 text-white text-left">Notifications</span>
                <div className={`w-12 h-7 rounded-full relative transition-colors ${notifications ? 'bg-orange-500' : 'bg-dark-600'}`}>
                  <motion.div 
                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow" 
                    animate={{ x: notifications ? 22 : 4 }} 
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>
            </div>
            
            {/* Logout */}
            <button 
              onClick={handleLogout} 
              className="w-full py-3.5 bg-red-500/10 text-red-400 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              <LogOut size={18} />Log Out
            </button>
          </div>
        )}

        {/* BADGES TAB */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            {/* Unlocked Badges */}
            <div className="bg-dark-800 rounded-2xl p-4 border border-white/5">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Award size={16} className="text-yellow-400" />
                Unlocked ({unlockedBadges.length}/{BADGES.length})
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {unlockedBadges.map(badge => (
                  <button 
                    key={badge.id} 
                    onClick={() => setSelectedBadge({ badge, unlocked: true })} 
                    className="flex flex-col items-center p-2 rounded-xl bg-dark-700/50 border border-white/5 hover:border-white/20 transition-colors"
                  >
                    <span className="text-2xl mb-1">{badge.emoji}</span>
                    <span className="text-[9px] text-white truncate w-full text-center">{badge.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
              <div className="bg-dark-800 rounded-2xl p-4 border border-white/5">
                <h3 className="font-bold text-dark-400 mb-3 flex items-center gap-2">
                  <Lock size={14} />
                  Locked ({lockedBadges.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {lockedBadges.map(badge => (
                    <button 
                      key={badge.id} 
                      onClick={() => setSelectedBadge({ badge, unlocked: false })} 
                      className="flex flex-col items-center p-2 rounded-xl bg-dark-700/30 opacity-50"
                    >
                      <span className="text-2xl mb-1 grayscale">🔒</span>
                      <span className="text-[9px] text-dark-500 truncate w-full text-center">{badge.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : predictions.length > 0 ? (
              predictions.map((bet, i) => {
                const isResolved = bet.is_resolved || bet.quest_status === 'resolved' || bet.status === 'resolved';
                const won = bet.won || bet.is_winner;
                const amount = Number(bet.amount) || 0;
                const payout = Number(bet.payout) || Number(bet.potential_payout) || (amount * 1.8);
                const profit = won ? payout - amount : -amount;
                const roi = amount > 0 ? ((profit / amount) * 100).toFixed(0) : 0;
                
                return (
                  <div key={bet.id || i} className="bg-dark-800 rounded-2xl p-4 border border-white/5">
                    {/* Header */}
                    <div className="flex justify-between mb-3">
                      <p className="text-sm text-white font-medium line-clamp-1 flex-1 pr-2">
                        {bet.quest_title || bet.quest?.title || 'Prediction'}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        won ? 'bg-green-500/20 text-green-400' : 
                        isResolved ? 'bg-red-500/20 text-red-400' : 
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {won ? '✓ WON' : isResolved ? '✗ LOST' : '⏳ Pending'}
                      </span>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-dark-700/50 rounded-lg p-2">
                        <p className="text-dark-500 mb-0.5">Pick</p>
                        <p className={`font-medium ${bet.chosen_option === 'a' ? 'text-green-400' : 'text-red-400'}`}>
                          {bet.chosen_option === 'a' ? '✓ Yes' : '✗ No'}
                        </p>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-2">
                        <p className="text-dark-500 mb-0.5">Amount</p>
                        <p className="text-white font-medium">{formatSatz(amount)}</p>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-2">
                        <p className="text-dark-500 mb-0.5">{isResolved ? 'Result' : 'Potential'}</p>
                        <p className={`font-bold ${won ? 'text-green-400' : isResolved ? 'text-red-400' : 'text-white'}`}>
                          {won ? `+${formatSatz(profit)}` : isResolved ? `-${formatSatz(amount)}` : `~${formatSatz(payout)}`}
                        </p>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-2">
                        <p className="text-dark-500 mb-0.5">ROI</p>
                        <p className={`font-medium ${won ? 'text-green-400' : isResolved ? 'text-red-400' : 'text-dark-400'}`}>
                          {isResolved ? `${roi}%` : '—'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Odds Bar (if available) */}
                    {(bet.odds_at_bet || bet.pool_a) && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden flex">
                          <div className="h-full bg-green-500" style={{ width: `${bet.odds_at_bet || 50}%` }} />
                          <div className="h-full bg-red-500" style={{ width: `${100 - (bet.odds_at_bet || 50)}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-dark-500 mt-1">
                          <span>Yes {bet.odds_at_bet || 50}%</span>
                          <span>No {100 - (bet.odds_at_bet || 50)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-dark-800 rounded-2xl p-8 text-center border border-white/5">
                <Target size={40} className="text-dark-600 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">No predictions yet</p>
                <p className="text-xs text-dark-500 mb-4">Make your first prediction to see it here</p>
                <Link to="/pools">
                  <button className="px-6 py-2 bg-orange-500 text-black rounded-xl font-medium text-sm">
                    Start Predicting
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
