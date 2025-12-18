import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Swords, UsersRound, Trophy, Building2, ShoppingBag, Rocket, BarChart3, Settings, ChevronRight, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import telegram from '../services/telegram';
import { formatSatz, getTierInfo, copyToClipboard } from '../utils/helpers';

const menuSections = [
  {
    title: 'Social',
    items: [
      { id: 'friends', label: 'Friends', icon: Users, path: '/friends', color: 'text-mint-400' },
      { id: 'challenges', label: 'Challenges', icon: Swords, path: '/challenges', color: 'text-orange-400' },
      { id: 'groups', label: 'Groups', icon: UsersRound, path: '/groups', color: 'text-purple-400' },
      { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard', color: 'text-gold-400' },
    ],
  },
  {
    title: 'Wallet',
    items: [
      { id: 'vault', label: 'BTC Vault', icon: Building2, path: '/vault', color: 'text-btc' },
      { id: 'boosters', label: 'Boosters', icon: Rocket, path: '/boosters', color: 'text-green-400' },
      { id: 'shop', label: 'Shop', icon: ShoppingBag, path: '/shop', color: 'text-pink-400' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'stats', label: 'My Stats', icon: BarChart3, path: '/stats', color: 'text-cyan-400' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', color: 'text-dark-300' },
    ],
  },
];

export default function MorePage() {
  const { user } = useUserStore();
  const tierInfo = getTierInfo(user?.tier || user?.status_tier || 'newcomer');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    telegram.hapticImpact('light');
    const code = user?.referral_code || user?.id;
    telegram.shareUrl(
      `https://t.me/MintIQBot?start=ref_${code}`,
      `🎯 Join me on MintIQ!\n\nPredict crypto & earn SATZ, redeem for real Bitcoin! 🚀\n\nUse my code: ${code}`
    );
  };

  const handleCopyCode = async () => {
    const code = user?.referral_code || user?.id;
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      telegram.hapticNotification('success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* User Profile Card */}
      <div className="px-4 pt-4 pb-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-800 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: tierInfo.color + '33', color: tierInfo.color }}>
              {user?.first_name?.[0] || '👤'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">{user?.first_name} {user?.last_name || ''}</h2>
              <p className="text-dark-400 text-sm">@{user?.username || 'anonymous'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: tierInfo.color + '33', color: tierInfo.color }}>{tierInfo.name}</span>
                <span className="text-dark-400 text-xs">{tierInfo.multiplier}x</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-dark-400">Balance</p>
              <p className="text-xl font-bold text-gold-400">{formatSatz(user?.satz_balance || 0)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Invite Card */}
      <div className="px-4 py-2">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-purple-300 font-medium">🚀 Invite & Earn</p>
              <p className="text-white text-lg font-bold">3-7% Lifetime Commission</p>
            </div>
            <button onClick={handleShare} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium flex items-center gap-2">
              <Share2 size={16} /> Share
            </button>
          </div>
          <div className="flex items-center gap-2 bg-dark-900/50 rounded-lg p-2">
            <span className="text-dark-400 text-sm">Your code:</span>
            <code className="text-purple-400 font-mono font-bold flex-1">{user?.referral_code || user?.id || 'N/A'}</code>
            <button onClick={handleCopyCode} className="p-2 text-dark-400 hover:text-white">
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="px-4 py-2">
        <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
          <h3 className="font-medium text-white mb-3">Account</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-dark-400">Joined</span><span className="text-white">{formatDate(user?.created_at)}</span></div>
            <div className="flex justify-between"><span className="text-dark-400">Referral Code</span><span className="text-purple-400 font-mono">{user?.referral_code || user?.id || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-dark-400">Referrals</span><span className="text-white">{user?.referral_count || 0}</span></div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <div key={section.title} className="px-4 py-2">
          <h3 className="text-sm font-medium text-dark-400 mb-2 px-1">{section.title}</h3>
          <div className="bg-dark-800 rounded-xl overflow-hidden border border-white/5">
            {section.items.map((item, idx) => (
              <Link key={item.id} to={item.path}
                className={`flex items-center gap-3 p-4 hover:bg-dark-700 transition-colors ${idx !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                onClick={() => telegram.hapticSelection()}
              >
                <item.icon size={20} className={item.color} />
                <span className="flex-1 text-white font-medium">{item.label}</span>
                <ChevronRight size={18} className="text-dark-500" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
