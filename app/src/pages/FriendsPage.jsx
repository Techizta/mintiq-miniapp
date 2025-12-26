/**
 * MintIQ FriendsPage - FIXED
 * 
 * FIXES:
 * 1. Added "Add Friend by Username" feature using user_friends table
 * 2. Tab to switch between Referrals and Friends
 * 3. Friends list with add/view functionality
 * 
 * Key Features:
 * - Clear 7% lifetime earnings value prop (tiered: 3-7%)
 * - Easy share functionality
 * - Referral leaderboard
 * - Add friends by username
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
  UserPlus,
  Percent,
  Search,
  X,
  UserCheck
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, formatCompact, copyToClipboard } from '../utils/helpers';

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
// ADD FRIEND MODAL
// ============================================

function AddFriendModal({ isOpen, onClose, onAdded }) {
  const [username, setUsername] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useUIStore();
  
  const handleAdd = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setIsAdding(true);
    setError('');
    
    try {
      const response = await api.post('/api/miniapp/friends/add', {
        username: username.trim()
      });
      
      telegram.hapticNotification('success');
      showToast('Friend added!', 'success');
      onAdded(response.friend);
      setUsername('');
      onClose();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to add friend';
      setError(message);
      telegram.hapticNotification('error');
    } finally {
      setIsAdding(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-dark-900 rounded-2xl w-full max-w-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Add Friend</h2>
            <button onClick={onClose} className="p-2 text-dark-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <p className="text-dark-400 text-sm mb-4">
            Enter your friend's Telegram username to add them
          </p>
          
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.replace('@', ''));
                setError('');
              }}
              placeholder="username"
              className="w-full bg-dark-800 rounded-xl pl-8 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-mint-500/50"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-dark-800 text-dark-400 rounded-xl font-medium"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              disabled={isAdding || !username.trim()}
              className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                isAdding || !username.trim()
                  ? 'bg-dark-700 text-dark-500'
                  : 'bg-mint-500 text-white'
              }`}
            >
              {isAdding ? (
                'Adding...'
              ) : (
                <>
                  <UserPlus size={18} />
                  Add
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function FriendsPage() {
  const { user, fetchUser } = useUserStore();
  const { showToast } = useUIStore();
  
  // State
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [friends, setFriends] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invite'); // 'invite' | 'friends'
  const [showAddModal, setShowAddModal] = useState(false);

  // ============================================
  // DATA FETCHING
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
        fetchStats(),
        fetchFriends()
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
  
  const fetchFriends = async () => {
    try {
      const response = await api.get('/api/miniapp/friends/list');
      setFriends(response.friends || []);
    } catch (e) {
      console.error('Friends fetch error:', e);
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
  
  const handleInviteContact = () => {
    telegram.hapticSelection();
    const link = `https://t.me/MintIQBot?start=${user?.referral_code || 'ref'}`;
    telegram.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('🎯 Join me on MintIQ! Predict crypto & earn Bitcoin. Get 250 SATZ bonus!')}`);
  };
  
  const handleFriendAdded = (newFriend) => {
    setFriends(prev => [newFriend, ...prev]);
  };

  // ============================================
  // COMPUTED
  // ============================================

  const referralCount = user?.referral_count || referrals.length || 0;
  const totalEarned = stats?.totalEarned || 0;
  const referralLink = `https://t.me/MintIQBot?start=${user?.referral_code || 'ref'}`;
  const commissionRate = stats?.commissionRate || 7; // Tiered: 3-7%
  
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
            Earn <span className="text-mint-400 font-bold">{commissionRate}% commission</span> from referrals
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
                ? 'bg-purple-500 text-white'
                : 'text-dark-400'
            }`}
          >
            My Friends ({friends.length})
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {activeTab === 'invite' ? (
          // ============================================
          // INVITE TAB
          // ============================================
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-800 rounded-xl p-4 text-center border border-white/5">
                <p className="text-3xl font-black text-white">{referralCount}</p>
                <p className="text-xs text-dark-400">Friends Invited</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-4 text-center border border-white/5">
                <p className="text-3xl font-black text-mint-400">{formatCompact(totalEarned)}</p>
                <p className="text-xs text-dark-400">SATZ Earned</p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-5 border border-blue-500/20">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" />
                How It Works
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">Share your link</p>
                    <p className="text-xs text-dark-400">Friends join using your unique code</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">They get 250 SATZ bonus</p>
                    <p className="text-xs text-dark-400">Welcome bonus for new users</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-mint-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">You earn {commissionRate}% forever</p>
                    <p className="text-xs text-dark-400">Every time they earn, you earn too!</p>
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
                  <Share2 size={18} />
                  Share Link
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInviteContact}
                  className="bg-dark-800 rounded-xl p-4 text-white font-medium flex items-center justify-center gap-2 border border-white/5"
                >
                  <UserPlus size={18} />
                  Invite Contact
                </motion.button>
              </div>
            </div>

            {/* Milestone Progress */}
            {nextTier && (
              <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crown size={16} className="text-gold-400" />
                    <span className="font-medium text-white text-sm">Next Milestone</span>
                  </div>
                  <span className="text-gold-400 font-bold">+{formatSatz(nextTier.bonus)} SATZ</span>
                </div>
                
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold-500 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-dark-400">
                  <span>{referralCount} friends</span>
                  <span>{nextTier.count} friends</span>
                </div>
              </div>
            )}

            {/* Referral List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-white">Your Referrals</h2>
                <span className="text-xs text-dark-400">{referralCount} total</span>
              </div>
              
              {referrals.length === 0 ? (
                <div className="text-center py-8 bg-dark-800 rounded-xl">
                  <Users size={40} className="mx-auto mb-3 text-dark-600" />
                  <p className="text-dark-400 font-medium">No referrals yet</p>
                  <p className="text-dark-500 text-sm mt-1">Share your link to start earning!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrals.slice(0, 10).map((ref, index) => (
                    <div 
                      key={ref.id || index}
                      className="bg-dark-800 rounded-xl p-3 flex items-center gap-3 border border-white/5"
                    >
                      <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center text-lg">
                        {ref.first_name?.[0] || ref.username?.[0] || '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">
                          {ref.first_name || ref.username || 'Anonymous'}
                        </p>
                        <p className="text-xs text-dark-500">
                          Joined {new Date(ref.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-mint-400 font-bold text-sm">
                          +{formatSatz(ref.commission_earned || 0)}
                        </p>
                        <p className="text-xs text-dark-500">earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // ============================================
          // FRIENDS TAB - NEW
          // ============================================
          <>
            {/* Add Friend Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Add Friend by Username
            </motion.button>
            
            {/* Friends List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-white">Your Friends</h2>
                <span className="text-xs text-dark-400">{friends.length} total</span>
              </div>
              
              {friends.length === 0 ? (
                <div className="text-center py-12 bg-dark-800 rounded-xl">
                  <UserCheck size={48} className="mx-auto mb-4 text-dark-600" />
                  <p className="text-dark-400 font-medium mb-2">No friends yet</p>
                  <p className="text-dark-500 text-sm">Add friends to see them here!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend, index) => (
                    <motion.div 
                      key={friend.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-dark-800 rounded-xl p-4 flex items-center gap-3 border border-white/5"
                    >
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-xl">
                        {friend.first_name?.[0] || friend.username?.[0] || '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {friend.first_name || friend.username || 'Anonymous'}
                        </p>
                        {friend.username && (
                          <p className="text-xs text-dark-500">@{friend.username}</p>
                        )}
                        <p className="text-xs text-dark-500 mt-0.5">
                          Added {friend.friends_since ? new Date(friend.friends_since).toLocaleDateString() : 'recently'}
                        </p>
                      </div>
                      {friend.status_tier && (
                        <div className="text-right">
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full capitalize">
                            {friend.status_tier}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Info Card */}
            <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
              <p className="text-xs text-dark-400">
                💡 Friends you add here are separate from referrals. Add your existing MintIQ friends to keep track of them!
              </p>
            </div>
          </>
        )}

        {/* Milestone Rewards - Only show on invite tab */}
        {activeTab === 'invite' && (
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
                        isAchieved 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-dark-700 text-dark-400'
                      }`}>
                        {isAchieved ? '✓' : tier.count}
                      </div>
                      <span className={`text-sm ${isAchieved ? 'text-dark-400' : 'text-white'}`}>
                        {tier.label}
                      </span>
                    </div>
                    <span className={`font-bold ${isAchieved ? 'text-dark-500' : 'text-gold-400'}`}>
                      +{formatSatz(tier.bonus)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={handleFriendAdded}
      />
    </div>
  );
}
