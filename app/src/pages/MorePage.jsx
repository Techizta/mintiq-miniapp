/**
 * MintIQ MorePage - FIXED
 * 
 * Key Fixes:
 * - Consistent "Ranks" naming
 * - All settings links work properly
 * - Proper navigation to settings page
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy,
  Target,
  Settings,
  HelpCircle,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Crown,
  Sparkles,
  Zap,
  Gift,
  Star,
  TrendingUp,
  Plus,
  Lock,
  Globe,
  Award,
  BarChart3,
  UserPlus,
  Coins
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, formatCompact, getTierInfo } from '../utils/helpers';

// ============================================
// GROUPS FEATURE CARD
// ============================================

function GroupsFeatureCard() {
  const [groupStats, setGroupStats] = useState(null);
  
  useEffect(() => {
    fetchGroupStats();
  }, []);
  
  const fetchGroupStats = async () => {
    try {
      const response = await api.get('/api/miniapp/groups/my-stats');
      setGroupStats(response);
    } catch (e) {
      // Groups might not be set up yet
    }
  };
  
  return (
    <Link to="/groups">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-orange-500/10 rounded-2xl p-5 border border-purple-500/30 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Prediction Groups</h3>
                <p className="text-sm text-purple-300/80">Create • Compete • Earn</p>
              </div>
            </div>
            <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded-full">
              HOT 🔥
            </span>
          </div>
          
          {/* Value Props */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Crown size={16} className="text-gold-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Be a Group Admin</p>
                <p className="text-xs text-dark-400">Earn 5% from all group predictions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Target size={16} className="text-mint-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Create Custom Quests</p>
                <p className="text-xs text-dark-400">Set your own prediction topics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Trophy size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Private Leaderboards</p>
                <p className="text-xs text-dark-400">Compete with your community</p>
              </div>
            </div>
          </div>
          
          {/* Stats or CTA */}
          {groupStats?.totalGroups > 0 ? (
            <div className="flex gap-3">
              <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-white">{groupStats.groupsOwned || 0}</p>
                <p className="text-xs text-dark-400">Your Groups</p>
              </div>
              <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-mint-400">{formatCompact(groupStats.totalEarned || 0)}</p>
                <p className="text-xs text-dark-400">SATZ Earned</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-purple-400" />
                <span className="text-sm font-medium text-white">Create Your First Group</span>
              </div>
              <ChevronRight size={18} className="text-dark-400" />
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

// ============================================
// CHALLENGES FEATURE CARD
// ============================================

function ChallengesFeatureCard() {
  const [activeChallenges, setActiveChallenges] = useState(0);
  
  useEffect(() => {
    fetchChallenges();
  }, []);
  
  const fetchChallenges = async () => {
    try {
      const response = await api.get('/api/miniapp/challenges/active');
      setActiveChallenges(response.challenges?.length || 0);
    } catch (e) {
      // Challenges might not be set up
    }
  };
  
  return (
    <Link to="/challenges">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-orange-500/20 via-red-500/10 to-pink-500/10 rounded-2xl p-5 border border-orange-500/30 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Award size={24} className="text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Challenges</h3>
                <p className="text-sm text-orange-300/80">Compete for big prizes</p>
              </div>
            </div>
            {activeChallenges > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {activeChallenges} LIVE
              </span>
            )}
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3">
              <Zap size={18} className="text-orange-400 mb-1" />
              <p className="text-xs font-medium text-white">Weekly Contests</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <Gift size={18} className="text-pink-400 mb-1" />
              <p className="text-xs font-medium text-white">Prize Pools</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
            <span className="text-sm font-medium text-white">View Active Challenges</span>
            <ChevronRight size={18} className="text-dark-400" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function MorePage() {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { showToast } = useUIStore();
  
  const tierInfo = getTierInfo(user?.status_tier || 'newcomer');

  // ============================================
  // HANDLERS
  // ============================================

  const handleLogout = async () => {
    telegram.hapticImpact('medium');
    try {
      await logout();
      navigate('/');
      showToast('Logged out successfully', 'success');
    } catch (e) {
      showToast('Logout failed', 'error');
    }
  };

  // ============================================
  // MENU ITEMS - FIXED: Renamed to Ranks, all paths work
  // ============================================

  const quickLinks = [
    { icon: Trophy, label: 'Ranks', path: '/leaderboard', color: 'text-gold-400', bg: 'bg-gold-500/20' },
    { icon: Users, label: 'Friends', path: '/friends', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { icon: Zap, label: 'Boosters', path: '/boosters', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { icon: BarChart3, label: 'My Stats', path: '/stats', color: 'text-mint-400', bg: 'bg-mint-500/20' },
  ];
  
  // FIXED: All paths now point to /settings which handles all these sections
  const settingsLinks = [
    { icon: Bell, label: 'Notifications', path: '/settings', section: 'notifications' },
    { icon: Shield, label: 'Security', path: '/settings', section: 'security' },
    { icon: HelpCircle, label: 'Help & Support', path: '/settings', section: 'support' },
    { icon: Globe, label: 'Language', path: '/settings', section: 'language' },
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-dark-800 to-dark-950 px-4 pt-6 pb-8">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-mint-500 to-cyan-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
              {user?.first_name?.[0] || user?.username?.[0] || '?'}
            </div>
            {tierInfo && (
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{ backgroundColor: tierInfo.color || '#10B981' }}
              >
                {tierInfo.icon || '⭐'}
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">
              {user?.first_name || user?.username || 'User'}
            </h2>
            <p className="text-sm text-dark-400 capitalize">{user?.status_tier || 'Newcomer'}</p>
          </div>
          
          {/* Settings */}
          <Link to="/settings" className="p-2 bg-dark-800 rounded-xl">
            <Settings size={20} className="text-dark-400" />
          </Link>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-dark-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{user?.predictions_made || 0}</p>
            <p className="text-xs text-dark-400">Predictions</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-mint-400">{user?.win_rate || 0}%</p>
            <p className="text-xs text-dark-400">Win Rate</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gold-400">{user?.current_streak || 0}</p>
            <p className="text-xs text-dark-400">Day Streak</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 -mt-2">
        {/* ============================================ */}
        {/* GROUPS - PROMINENTLY FEATURED */}
        {/* ============================================ */}
        <GroupsFeatureCard />

        {/* ============================================ */}
        {/* CHALLENGES */}
        {/* ============================================ */}
        <ChallengesFeatureCard />

        {/* ============================================ */}
        {/* QUICK LINKS */}
        {/* ============================================ */}
        <div>
          <h3 className="text-sm font-semibold text-dark-400 mb-3 px-1">Quick Links</h3>
          <div className="grid grid-cols-4 gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="bg-dark-800 rounded-xl p-3 text-center border border-white/5 hover:border-mint-500/30 transition-colors"
              >
                <div className={`w-10 h-10 ${link.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <link.icon size={20} className={link.color} />
                </div>
                <p className="text-xs text-white font-medium">{link.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* SETTINGS & SUPPORT */}
        {/* ============================================ */}
        <div>
          <h3 className="text-sm font-semibold text-dark-400 mb-3 px-1">Settings</h3>
          <div className="bg-dark-800 rounded-xl border border-white/5 divide-y divide-white/5">
            {settingsLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="flex items-center gap-3 p-4 hover:bg-dark-750 transition-colors"
              >
                <link.icon size={20} className="text-dark-400" />
                <span className="flex-1 text-white text-sm">{link.label}</span>
                <ChevronRight size={16} className="text-dark-600" />
              </Link>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* ABOUT & LOGOUT */}
        {/* ============================================ */}
        <div className="space-y-3">
          {/* App Info */}
          <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-sm">MintIQ</p>
                <p className="text-xs text-dark-500">Version 1.0.0</p>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href="https://twitter.com/mintiqworld" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-dark-700 rounded-lg flex items-center justify-center"
                >
                  <span className="text-sm">𝕏</span>
                </a>
                <a 
                  href="https://t.me/mintiqcommunity" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-dark-700 rounded-lg flex items-center justify-center"
                >
                  <span className="text-sm">📢</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Logout */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full bg-red-500/10 text-red-400 rounded-xl p-4 font-medium flex items-center justify-center gap-2 border border-red-500/20"
          >
            <LogOut size={18} />
            Log Out
          </motion.button>
        </div>

        {/* Bottom Spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
