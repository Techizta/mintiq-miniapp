/**
 * MintIQ GroupsPage - FIXED
 * 
 * FIXES:
 * 1. Create Group modal is now scrollable and doesn't cut off
 * 2. Uses correct API endpoints (/groups/my, /groups/discover, etc.)
 * 3. Better mobile viewport handling
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus,
  Search,
  Crown,
  Lock,
  Globe,
  TrendingUp,
  ChevronRight,
  Target,
  Trophy,
  Settings,
  Copy,
  Check,
  Sparkles,
  BarChart3,
  UserPlus,
  Coins,
  X
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, formatCompact, copyToClipboard } from '../utils/helpers';

// ============================================
// CREATE GROUP MODAL - FIXED: Scrollable
// ============================================

function CreateGroupModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useUIStore();
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setIsPrivate(false);
    }
  }, [isOpen]);
  
  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('Please enter a group name', 'error');
      return;
    }
    
    setIsCreating(true);
    try {
      const response = await api.post('/api/miniapp/groups/create', {
        name: name.trim(),
        description: description.trim(),
        is_private: isPrivate
      });
      
      telegram.hapticNotification('success');
      showToast('Group created!', 'success');
      onCreated(response.group);
      onClose();
    } catch (error) {
      showToast(error.message || 'Failed to create group', 'error');
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        {/* FIXED: Added max-h and overflow-y-auto for scrolling */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-dark-900 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
        >
          <div className="p-6">
            {/* Sticky Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Group</h2>
              <button 
                onClick={onClose} 
                className="p-2 text-dark-400 hover:text-white rounded-full hover:bg-dark-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-400 mb-2 block">Group Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Crypto Traders Club"
                  className="w-full bg-dark-800 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-mint-500/50"
                  maxLength={50}
                />
              </div>
              
              <div>
                <label className="text-sm text-dark-400 mb-2 block">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's your group about?"
                  rows={3}
                  className="w-full bg-dark-800 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-mint-500/50 resize-none"
                  maxLength={200}
                />
              </div>
              
              <div className="flex items-center justify-between bg-dark-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {isPrivate ? <Lock size={20} className="text-purple-400" /> : <Globe size={20} className="text-mint-400" />}
                  <div>
                    <p className="font-medium text-white text-sm">{isPrivate ? 'Private Group' : 'Public Group'}</p>
                    <p className="text-xs text-dark-400">
                      {isPrivate ? 'Invite only' : 'Anyone can join'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 rounded-full transition-colors ${isPrivate ? 'bg-purple-500' : 'bg-dark-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              
              {/* Admin Benefits */}
              <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4">
                <p className="font-medium text-gold-400 text-sm mb-2 flex items-center gap-2">
                  <Crown size={16} /> Admin Benefits
                </p>
                <ul className="space-y-1 text-xs text-dark-300">
                  <li>• Earn 5% from all group predictions</li>
                  <li>• Create custom prediction topics</li>
                  <li>• Manage members and settings</li>
                  <li>• Private leaderboard for your community</li>
                </ul>
              </div>
              
              {/* FIXED: Button with proper spacing */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={isCreating || !name.trim()}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                  isCreating || !name.trim()
                    ? 'bg-dark-700 text-dark-400'
                    : 'bg-gradient-to-r from-mint-500 to-cyan-500'
                }`}
              >
                {isCreating ? 'Creating...' : 'Create Group'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function GroupsPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { showToast } = useUIStore();
  
  // State
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'discover'
  const [myGroups, setMyGroups] = useState([]);
  const [discoverGroups, setDiscoverGroups] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedGroupId, setCopiedGroupId] = useState(null);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'discover') {
      fetchDiscoverGroups();
    }
  }, [activeTab, searchQuery]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchMyGroups(),
        fetchAdminStats()
      ]);
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchMyGroups = async () => {
    try {
      const response = await api.get('/api/miniapp/groups/my');
      setMyGroups(response.groups || []);
    } catch (e) {
      console.error('My groups fetch error:', e);
      // Fallback to old endpoint
      try {
        const fallback = await api.get('/api/miniapp/groups');
        setMyGroups(fallback.groups || []);
      } catch (e2) {
        console.error('Groups fallback error:', e2);
      }
    }
  };
  
  const fetchDiscoverGroups = async () => {
    try {
      const response = await api.get('/api/miniapp/groups/discover', {
        params: searchQuery ? { search: searchQuery } : {}
      });
      setDiscoverGroups(response.groups || []);
    } catch (e) {
      console.error('Discover groups error:', e);
    }
  };
  
  const fetchAdminStats = async () => {
    try {
      const response = await api.get('/api/miniapp/groups/admin-stats');
      setAdminStats(response);
    } catch (e) {
      console.error('Admin stats error:', e);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleCopyInvite = async (group) => {
    const link = `https://t.me/MintIQBot?start=group_${group.invite_code}`;
    await copyToClipboard(link);
    setCopiedGroupId(group.id);
    telegram.hapticNotification('success');
    showToast('Invite link copied!', 'success');
    setTimeout(() => setCopiedGroupId(null), 2000);
  };
  
  const handleJoinGroup = async (group) => {
    try {
      await api.post(`/api/miniapp/groups/${group.id}/join`);
      telegram.hapticNotification('success');
      showToast(`Joined ${group.name}!`, 'success');
      
      // Move group from discover to my groups
      setDiscoverGroups(prev => prev.filter(g => g.id !== group.id));
      setMyGroups(prev => [...prev, { ...group, your_role: 'member' }]);
      setActiveTab('my');
    } catch (error) {
      showToast(error.message || 'Failed to join group', 'error');
    }
  };
  
  const handleGroupCreated = (newGroup) => {
    setMyGroups(prev => [newGroup, ...prev]);
    fetchAdminStats();
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-500/10 to-dark-950 px-4 pt-6 pb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Prediction Groups</h1>
          <p className="text-dark-400">Create groups & earn 5% from all predictions</p>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Admin Stats */}
        {adminStats && (adminStats.groupsOwned > 0 || adminStats.totalEarned > 0) && (
          <div className="bg-gradient-to-br from-gold-500/10 to-orange-500/10 rounded-2xl p-4 border border-gold-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Crown size={18} className="text-gold-400" />
              <span className="font-bold text-white">Admin Dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{adminStats.groupsOwned || 0}</p>
                <p className="text-xs text-dark-400">Groups Owned</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">{adminStats.totalMembers || 0}</p>
                <p className="text-xs text-dark-400">Total Members</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gold-400">{formatSatz(adminStats.totalEarned || 0)}</p>
                <p className="text-xs text-dark-400">Earned</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-dark-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'my'
                ? 'bg-purple-500 text-white'
                : 'text-dark-400'
            }`}
          >
            My Groups
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'discover'
                ? 'bg-mint-500 text-white'
                : 'text-dark-400'
            }`}
          >
            Discover
          </button>
        </div>

        {/* Create Group Button - My Tab */}
        {activeTab === 'my' && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Create New Group
          </motion.button>
        )}

        {/* Search - Discover Tab */}
        {activeTab === 'discover' && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full bg-dark-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-dark-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-dark-700 rounded w-32 mb-2" />
                  <div className="h-3 bg-dark-700 rounded w-20" />
                </div>
              </div>
            </div>
          ))
        ) : activeTab === 'my' ? (
          // ============================================
          // MY GROUPS
          // ============================================
          myGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Groups Yet</h3>
              <p className="text-dark-400 text-sm mb-6 max-w-xs mx-auto">
                Create your first group and start earning 5% from all predictions!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-800 rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-xl">
                      {group.emoji || '👥'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white truncate">{group.name}</h3>
                        {(group.is_admin || group.your_role === 'admin') && (
                          <Crown size={14} className="text-gold-400 flex-shrink-0" />
                        )}
                        {group.is_private && (
                          <Lock size={12} className="text-purple-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-dark-400">
                        {group.member_count || 0} members • {group.active_quests || 0} active predictions
                      </p>
                    </div>
                  </div>
                  
                  {/* Group Stats */}
                  {(group.is_admin || group.your_role === 'admin') && (
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 bg-dark-700 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-gold-400">{formatSatz(group.admin_earnings || 0)}</p>
                        <p className="text-2xs text-dark-500">Earned</p>
                      </div>
                      <div className="flex-1 bg-dark-700 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-white">{group.total_predictions || 0}</p>
                        <p className="text-2xs text-dark-500">Predictions</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link 
                      to={`/groups/${group.id}`}
                      className="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium text-center"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => handleCopyInvite(group)}
                      className="px-4 py-2 bg-dark-700 text-white rounded-lg text-sm flex items-center gap-1"
                    >
                      {copiedGroupId === group.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedGroupId === group.id ? 'Copied' : 'Invite'}
                    </button>
                    {(group.is_admin || group.your_role === 'admin') && (
                      <Link 
                        to={`/groups/${group.id}/settings`}
                        className="px-3 py-2 bg-dark-700 text-dark-400 rounded-lg"
                      >
                        <Settings size={16} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          // ============================================
          // DISCOVER GROUPS
          // ============================================
          discoverGroups.length === 0 ? (
            <div className="text-center py-12">
              <Search size={40} className="mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400 font-medium">No groups found</p>
              <p className="text-sm text-dark-500 mt-1">Try a different search or create your own!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {discoverGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-800 rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-mint-500/20 rounded-xl flex items-center justify-center text-xl">
                      {group.emoji || '🎯'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{group.name}</h3>
                      <p className="text-xs text-dark-400 truncate">{group.description || 'No description'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-dark-400">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {group.member_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={12} /> {group.total_predictions || 0} predictions
                      </span>
                    </div>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoinGroup(group)}
                      className="px-4 py-2 bg-mint-500 text-white rounded-lg text-sm font-medium flex items-center gap-1"
                    >
                      <UserPlus size={14} />
                      Join
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleGroupCreated}
      />
    </div>
  );
}
