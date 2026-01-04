/**
 * MintIQ FriendsPage - FIXED
 * 
 * Changes:
 * - Removed "Add Friend by Username" feature
 * - Friends = users who joined via your referral link
 * - Uses badge system instead of status_tier
 * - Tiered commission: 3%, 5%, 7%
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Gift, 
  TrendingUp,
  ChevronRight,
  Crown,
  Sparkles,
  ArrowRight,
  Percent,
  UserCheck
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, formatCompact, copyToClipboard } from '../utils/helpers';

// ============================================
// BADGE SYSTEM (same as ProfilePage)
// ============================================

const BADGES = [
  { id: 'newcomer', name: 'Newcomer', emoji: '🌱', color: '#888888' },
  { id: 'first_win', name: 'First Blood', emoji: '🎯', requirement: { wins: 1 }, color: '#10B981' },
  { id: 'streak_3', name: 'Hot Streak', emoji: '🔥', requirement: { streak: 3 }, color: '#F59E0B' },
  { id: 'predictor_10', name: 'Predictor', emoji: '🔮', requirement: { predictions: 10 }, color: '#8B5CF6' },
  { id: 'winner_5', name: 'Lucky 5', emoji: '🍀', requirement: { wins: 5 }, color: '#22C55E' },
  { id: 'streak_7', name: 'Week Warrior', emoji: '⚔️', requirement: { streak: 7 }, color: '#EF4444' },
  { id: 'predictor_50', name: 'Oracle', emoji: '🧙', requirement: { predictions: 50 }, color: '#6366F1' },
  { id: 'winner_25', name: 'High Roller', emoji: '🎰', requirement: { wins: 25 }, color: '#EC4899' },
  { id: 'whale', name: 'Whale', emoji: '🐋', requirement: { totalWon: 10000 }, color: '#0EA5E9' },
  { id: 'predictor_100', name: 'Grandmaster', emoji: '👑', requirement: { predictions: 100 }, color: '#FFD700' },
];

// Get badge for a friend based on their stats
const getFriendBadge = (friend) => {
  // Check badges in reverse order (highest first)
  for (let i = BADGES.length - 1; i >= 0; i--) {
    const badge = BADGES[i];
    if (!badge.requirement) continue; // Skip newcomer
    
    const req = badge.requirement;
    let unlocked = true;
    
    if (req.wins && (friend.predictions_won || 0) < req.wins) unlocked = false;
    if (req.predictions && (friend.predictions_made || 0) < req.predictions) unlocked = false;
    if (req.streak && (friend.current_streak || 0) < req.streak) unlocked = false;
    if (req.totalWon && (friend.total_won || 0) < req.totalWon) unlocked = false;
    
    if (unlocked) return badge;
  }
  return BADGES[0]; // Newcomer
};

// ============================================
// CONSTANTS
// ============================================

const REFERRAL_TIERS = [
  { count: 1, bonus: 100, label: 'First Friend' },
  { count: 5, bonus: 500, label: '5 Friends' },
  { count: 10, bonus: 1500, label: '10 Friends' },
  { count: 25, bonus: 5000, label: '25 Friends' },
  { count: 50, bonus: 15000, label: '50 Friends' },
  { count: 100, bonus: 50000, label: '100 Friends' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function FriendsPage() {
  const { user, fetchUser } = useUserStore();
  const { showToast } = useUIStore();
  
  const [activeTab, setActiveTab] = useState('invite');
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // ============================================
  // EFFECTS & DATA LOADING
  // ============================================
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUser(true),
        fetchReferrals(),
        fetchStats()
      ]);
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchReferrals = async () => {
    try {
      const response = await api.get('/api/miniapp/referrals');
      setReferrals(response.referrals || []);
    } catch (e) {
      console.error('Referrals fetch error:', e);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await api.get('/api/miniapp/referrals/stats');
      setStats(response);
    } catch (e) {
      console.error('Stats fetch error:', e);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleCopyLink = async () => {
    const link = `https://t.me/MintIQBot?start=${user?.referral_code || 'ref'}`;
    await copyToClipboard(link);
    setCopied(true);
    telegram.hapticNotification('success');
    showToast('Link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = () => {
    telegram.hapticSelection();
    const link = `https://t.me/MintIQBot?start=${user?.referral_code || 'ref'}`;
    const message = `🎯 Join me on MintIQ!\n\nPredict crypto & earn real Bitcoin.\n\n✨ Get 250 SATZ bonus when you join!\n\n${link}`;
    telegram.shareUrl(link, message);
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const referralCount = user?.referral_count || referrals.length || 0;
  const totalEarned = stats?.totalEarned || 0;
  const referralLink = `https://t.me/MintIQBot?start=${user?.referral_code || 'ref'}`;
  const commissionRate = stats?.commissionRate || (referralCount >= 100 ? 7 : referralCount >= 10 ? 5 : 3);
  
  // Find current and next tier
  const currentTier = REFERRAL_TIERS.filter(t => referralCount >= t.count).pop();
  const nextTier = REFERRAL_TIERS.find(t => referralCount < t.count);
  const progressToNext = nextTier 
    ? ((referralCount - (currentTier?.count || 0)) / (nextTier.count - (currentTier?.count || 0))) * 100
    : 100;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-500/10 to-dark-950 px-4 pt-6 pb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Friends & Referrals</h1>
          <p className="text-dark-400">
            Earn <span className="text-mint-400 font-bold">{commissionRate}% commission</span> on friend wins
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4 mb-4">
        <div className="flex bg-dark-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'invite'
                ? 'bg-mint-500 text-white'
                : 'text-dark-400'
            }`}
          >
            Invite & Earn
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'friends'
                ? 'bg-mint-500 text-white'
                : 'text-dark-400'
            }`}
          >
            Friends ({referrals.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-dark-800 rounded-xl h-24" />
            ))}
          </div>
        ) : activeTab === 'invite' ? (
          // ============================================
          // INVITE TAB
          // ============================================
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-mint-400 mb-2">
                  <Users size={16} />
                  <span className="text-xs text-dark-400">Friends Invited</span>
                </div>
                <p className="text-2xl font-bold text-white">{referralCount}</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-gold-400 mb-2">
                  <TrendingUp size={16} />
                  <span className="text-xs text-dark-400">Total Earned</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatSatz(totalEarned)}</p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
              <h3 className="font-bold text-white mb-4">How It Works</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-mint-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">Share your invite link</p>
                    <p className="text-xs text-dark-400">Send to friends who love crypto</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-mint-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">They get +250 SATZ</p>
                    <p className="text-xs text-dark-400">Welcome bonus for new users</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-mint-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">You earn {commissionRate}% on their wins</p>
                    <p className="text-xs text-dark-400">Commission on prediction profits</p>
                    <div className="flex gap-2 mt-2 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded ${referralCount < 10 ? 'bg-mint-500/20 text-mint-400' : 'bg-dark-700 text-dark-500'}`}>0-9: 3%</span>
                      <span className={`px-1.5 py-0.5 rounded ${referralCount >= 10 && referralCount < 100 ? 'bg-mint-500/20 text-mint-400' : 'bg-dark-700 text-dark-500'}`}>10-99: 5%</span>
                      <span className={`px-1.5 py-0.5 rounded ${referralCount >= 100 ? 'bg-mint-500/20 text-mint-400' : 'bg-dark-700 text-dark-500'}`}>100+: 7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Actions */}
            <div className="space-y-3">
              {/* Copy Link */}
              <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-dark-400 mb-2">Your referral link</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-dark-700 rounded-lg px-3 py-2.5 text-sm text-dark-300 truncate">
                    {referralLink}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-mint-500 text-white'
                    }`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied' : 'Copy'}
                  </motion.button>
                </div>
              </div>
              
              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="bg-blue-500 rounded-xl p-4 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share Now
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopyLink}
                  className="bg-dark-700 rounded-xl p-4 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Copy size={20} />
                  Copy Link
                </motion.button>
              </div>
            </div>

            {/* Milestone Bonuses */}
            <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Gift size={16} className="text-gold-400" />
                Milestone Bonuses
              </h3>
              
              <div className="space-y-2">
                {REFERRAL_TIERS.map((tier) => {
                  const isAchieved = referralCount >= tier.count;
                  return (
                    <div 
                      key={tier.count}
                      className={`flex items-center justify-between py-2 ${
                        isAchieved ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          isAchieved ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-dark-400'
                        }`}>
                          {isAchieved ? '✓' : tier.count}
                        </div>
                        <span className={`text-sm ${isAchieved ? 'text-dark-400' : 'text-white'}`}>
                          {tier.label}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${isAchieved ? 'text-dark-500' : 'text-gold-400'}`}>
                        +{formatSatz(tier.bonus)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          // ============================================
          // FRIENDS TAB
          // ============================================
          <>
            {/* Friends List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-white">Your Referrals</h2>
                <span className="text-xs text-dark-400">{referrals.length} friends</span>
              </div>
              
              {referrals.length === 0 ? (
                <div className="text-center py-12 bg-dark-800 rounded-xl">
                  <UserCheck size={48} className="mx-auto mb-4 text-dark-600" />
                  <p className="text-dark-400 font-medium mb-2">No friends yet</p>
                  <p className="text-dark-500 text-sm mb-4">Share your link to invite friends!</p>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="bg-mint-500 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Share Link
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrals.map((friend, index) => {
                    const badge = getFriendBadge(friend);
                    return (
                      <motion.div 
                        key={friend.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-dark-800 rounded-xl p-4 flex items-center gap-3 border border-white/5"
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: badge.color + '20' }}
                        >
                          {badge.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {friend.first_name || friend.username || 'Anonymous'}
                          </p>
                          {friend.username && (
                            <p className="text-xs text-dark-500">@{friend.username}</p>
                          )}
                          <p className="text-xs text-dark-500 mt-0.5">
                            Joined {friend.created_at ? new Date(friend.created_at).toLocaleDateString() : 'recently'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: badge.color + '20', color: badge.color }}
                          >
                            {badge.name}
                          </span>
                          {friend.total_earned > 0 && (
                            <p className="text-xs text-dark-500 mt-1">
                              {formatSatz(friend.total_earned)} earned
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Info Card */}
            <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
              <p className="text-xs text-dark-400">
                💡 Friends who join using your link appear here automatically. You earn {commissionRate}% commission on their prediction profits!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
