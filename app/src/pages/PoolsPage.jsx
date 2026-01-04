/**
 * MintIQ PoolsPage - COMPLETE VERSION WITH SOCIAL POOLS
 * 
 * Features:
 * - Quests tab (auto-generated predictions)
 * - Social Pools tab (user-created pools)
 * - Pool creation flow
 * - Category filters
 * - Search
 * - Early Bird & Lucky Hour badges
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Clock, Users, TrendingUp, Search, Bot, Sparkles, 
  Plus, X, Calendar, Coins, AlertCircle, Star
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';

const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const formatTimeRemaining = (deadline) => {
  if (!deadline) return 'Open';
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return 'Ended';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours < 1) return `${minutes}m`;
  if (hours < 24) return `${hours}h ${minutes}m`;
  return `${Math.floor(hours / 24)}d`;
};

const isLuckyHour = () => {
  const hour = new Date().getHours();
  return [12, 18, 21].includes(hour);
};

const isEarlyBird = (quest) => {
  return (quest?.participant_count || 0) < 100;
};

// ============================================
// CREATE POOL MODAL
// ============================================

function CreatePoolModal({ onClose, onCreated }) {
  const { user } = useUserStore();
  const { showToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    optionA: 'Yes',
    optionB: 'No',
    category: 'other',
    deadline: '',
    minStake: 10
  });

  const categories = [
    { id: 'crypto', label: '₿ Crypto' },
    { id: 'sports', label: '⚽ Sports' },
    { id: 'politics', label: '🏛 Politics' },
    { id: 'entertainment', label: '🎬 Entertainment' },
    { id: 'tech', label: '💻 Tech' },
    { id: 'other', label: '🎯 Other' },
  ];

  const CREATION_FEE_STARS = 50; // 50 Stars to create a pool

  // Set default deadline to 24 hours from now
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setForm(prev => ({
      ...prev,
      deadline: tomorrow.toISOString().slice(0, 16)
    }));
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast('Please enter a question', 'error');
      return;
    }
    if (!form.optionA.trim() || !form.optionB.trim()) {
      showToast('Please enter both options', 'error');
      return;
    }
    if (!form.deadline) {
      showToast('Please set a deadline', 'error');
      return;
    }

    setIsSubmitting(true);
    telegram.hapticImpact('medium');

    try {
      // Step 1: Create invoice for Stars payment
      const invoiceResponse = await api.post('/api/miniapp/pools/create-invoice', {
        title: form.title.trim(),
        description: form.description.trim(),
        optionA: form.optionA.trim(),
        optionB: form.optionB.trim(),
        category: form.category,
        deadline: new Date(form.deadline).toISOString(),
        minStake: form.minStake
      });

      if (!invoiceResponse.invoiceLink) {
        throw new Error('Failed to create payment invoice');
      }

      // Step 2: Open Telegram payment (Stars)
      const WebApp = window.Telegram?.WebApp;
      if (WebApp?.openInvoice) {
        WebApp.openInvoice(invoiceResponse.invoiceLink, async (status) => {
          if (status === 'paid') {
            // Step 3: Verify payment and create pool
            try {
              const createResponse = await api.post('/api/miniapp/pools/finalize', {
                invoiceId: invoiceResponse.invoiceId
              });
              
              if (createResponse.success) {
                showToast('Pool created! 🎉', 'success');
                telegram.hapticNotification('success');
                onCreated?.(createResponse.pool);
                onClose();
              }
            } catch (e) {
              showToast('Payment received but pool creation failed. Contact support.', 'error');
            }
          } else if (status === 'cancelled') {
            showToast('Payment cancelled', 'info');
          } else if (status === 'failed') {
            showToast('Payment failed', 'error');
          }
          setIsSubmitting(false);
        });
      } else {
        // Fallback for non-Telegram environment (testing)
        showToast('Telegram payment not available', 'error');
        setIsSubmitting(false);
      }
    } catch (error) {
      showToast(error.message || 'Failed to create pool', 'error');
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
        className="bg-dark-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-900 px-4 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus size={20} className="text-orange-400" />
            Create Prediction Pool
          </h2>
          <button onClick={onClose} className="text-dark-400 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Cost notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-start gap-2">
            <Star size={16} className="text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-400 font-medium">Creation fee: 50 ⭐ Stars</p>
              <p className="text-dark-400 text-xs">You earn 5% of all pool winnings as creator</p>
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Your Question</label>
            <input
              type="text"
              placeholder="Will Bitcoin hit $100K by end of January?"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              maxLength={200}
              className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:border-orange-500/50 focus:outline-none"
            />
            <p className="text-xs text-dark-500 mt-1">{form.title.length}/200 characters</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-dark-400 mb-1 block">Option A</label>
              <input
                type="text"
                placeholder="Yes"
                value={form.optionA}
                onChange={e => setForm(prev => ({ ...prev, optionA: e.target.value }))}
                maxLength={50}
                className="w-full bg-dark-800 border border-green-500/30 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:border-green-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-dark-400 mb-1 block">Option B</label>
              <input
                type="text"
                placeholder="No"
                value={form.optionB}
                onChange={e => setForm(prev => ({ ...prev, optionB: e.target.value }))}
                maxLength={50}
                className="w-full bg-dark-800 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:border-red-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-dark-400 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(prev => ({ ...prev, category: cat.id }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    form.category === cat.id
                      ? 'bg-orange-500 text-black'
                      : 'bg-dark-800 text-dark-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-sm text-dark-400 mb-1 block flex items-center gap-1">
              <Calendar size={14} />
              Betting Deadline
            </label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500/50 focus:outline-none"
            />
          </div>

          {/* Min Stake */}
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Minimum Stake (SATZ)</label>
            <select
              value={form.minStake}
              onChange={e => setForm(prev => ({ ...prev, minStake: parseInt(e.target.value) }))}
              className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500/50 focus:outline-none"
            >
              <option value={10}>10 SATZ</option>
              <option value={50}>50 SATZ</option>
              <option value={100}>100 SATZ</option>
              <option value={500}>500 SATZ</option>
              <option value={1000}>1,000 SATZ</option>
            </select>
          </div>

          {/* Description (optional) */}
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Description (optional)</label>
            <textarea
              placeholder="Add more context..."
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              maxLength={500}
              className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:border-orange-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isSubmitting || !form.title.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-lg ${
              isSubmitting || !form.title.trim()
                ? 'bg-dark-700 text-dark-500'
                : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Create Pool (50 ⭐)'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// SOCIAL POOL CARD
// ============================================

function SocialPoolCard({ pool, index }) {
  const poolA = Number(pool.pool_a) || 0;
  const poolB = Number(pool.pool_b) || 0;
  const total = poolA + poolB;
  const oddsA = total > 0 ? Math.round((poolA / total) * 100) : 50;
  const timeLeft = formatTimeRemaining(pool.deadline);
  const isUrgent = timeLeft.includes('m') || timeLeft === 'Ended';

  return (
    <Link to={`/pools/${pool.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="bg-dark-800 border border-white/5 rounded-2xl p-4 active:bg-dark-750 mb-1"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[9px] flex items-center gap-0.5">
              <Users size={8} /> Social
            </span>
            <span className="px-1.5 py-0.5 bg-dark-700 text-dark-400 rounded text-[9px] capitalize">
              {pool.category || 'other'}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[10px] flex items-center gap-0.5 ${
            isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-dark-700 text-dark-400'
          }`}>
            <Clock size={10} />
            {timeLeft}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-white mb-2 line-clamp-2">{pool.title}</h3>

        {/* Creator */}
        <p className="text-[10px] text-dark-500 mb-3">
          by @{pool.creator_username || pool.creator_name || 'Anonymous'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[10px] text-dark-500 mb-3">
          <span className="flex items-center gap-0.5">
            <Users size={10} /> {pool.participant_count || 0}
          </span>
          <span className="flex items-center gap-0.5">
            <TrendingUp size={10} /> {formatNumber(total)} pool
          </span>
          <span className="text-dark-600">
            Min: {pool.min_stake || 10} SATZ
          </span>
        </div>

        {/* Odds Bar */}
        <div className="space-y-1.5">
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400" 
              style={{ width: `${oddsA}%` }} 
            />
            <div 
              className="h-full bg-gradient-to-r from-red-400 to-red-500" 
              style={{ width: `${100 - oddsA}%` }} 
            />
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-green-400">{pool.option_a || 'Yes'} {oddsA}%</span>
            <span className="text-red-400">{pool.option_b || 'No'} {100 - oddsA}%</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ============================================
// MAIN POOLS PAGE
// ============================================

export default function PoolsPage() {
  const { user } = useUserStore();
  const { showToast } = useUIStore();
  const [quests, setQuests] = useState([]);
  const [socialPools, setSocialPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('quests');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { 
    if (activeTab === 'quests') {
      loadQuests();
    } else {
      loadSocialPools();
    }
  }, [activeFilter, activeTab]);

  const loadQuests = async () => {
    setIsLoading(true);
    try {
      const params = { limit: 50, status: 'active' };
      if (activeFilter !== 'all') params.category = activeFilter;
      
      const response = await api.get('/api/miniapp/quests', params);
      setQuests(response?.quests || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const loadSocialPools = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/miniapp/pools/social');
      setSocialPools(response?.pools || []);
    } catch (e) { 
      console.error(e);
      setSocialPools([]);
    } finally { 
      setIsLoading(false); 
    }
  };

  const handlePoolCreated = (pool) => {
    setSocialPools(prev => [pool, ...prev]);
  };

  const filteredQuests = quests.filter(q => 
    !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPools = socialPools.filter(p =>
    !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'crypto', label: '₿ Crypto' },
    { id: 'sports', label: '⚽ Sports' },
    { id: 'politics', label: '🏛 Politics' },
    { id: 'entertainment', label: '🎬 Entertainment' },
    { id: 'tech', label: '💻 Tech' },
  ];

  const luckyHour = isLuckyHour();

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Create Pool Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePoolModal 
            onClose={() => setShowCreateModal(false)}
            onCreated={handlePoolCreated}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="text-orange-400" size={22} />
          Prediction Pools
        </h1>
        <p className="text-sm text-dark-400 mt-1">Predict outcomes & win SATZ</p>
      </div>

      <div className="px-4 pt-4">
        {/* Quest/Pool Tabs */}
        <div className="flex bg-dark-800 rounded-xl p-1 mb-4">
          <button
            onClick={() => { telegram.hapticSelection(); setActiveTab('quests'); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quests'
                ? 'bg-orange-500 text-black'
                : 'text-dark-400 hover:text-dark-300'
            }`}
          >
            <Bot size={14} />
            Quests
          </button>
          <button
            onClick={() => { telegram.hapticSelection(); setActiveTab('pools'); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pools'
                ? 'bg-orange-500 text-black'
                : 'text-dark-400 hover:text-dark-300'
            }`}
          >
            <Users size={14} />
            Social Pools
          </button>
        </div>

        {/* Lucky Hour Banner */}
        {luckyHour && activeTab === 'quests' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3 mb-4 flex items-center gap-2"
          >
            <Sparkles size={18} className="text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">
              🎉 Lucky Hour Active! Peak activity time
            </span>
          </motion.div>
        )}

        {/* Create Pool Button (Social Pools tab only) */}
        {activeTab === 'pools' && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { telegram.hapticImpact('medium'); setShowCreateModal(true); }}
            className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 mb-4 flex items-center justify-center gap-2"
          >
            <Plus size={20} className="text-purple-400" />
            <span className="text-purple-400 font-medium">Create Your Own Pool</span>
          </motion.button>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder={activeTab === 'quests' ? 'Search predictions...' : 'Search pools...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-800 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:border-orange-500/50 focus:outline-none"
          />
        </div>

        {/* Categories (Quests tab only) */}
        {activeTab === 'quests' && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { telegram.hapticSelection(); setActiveFilter(cat.id); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === cat.id 
                    ? 'bg-orange-500 text-black' 
                    : 'bg-dark-800 text-dark-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'quests' ? (
          // Quests List
          filteredQuests.length > 0 ? (
            <div className="space-y-4">
              {filteredQuests.map((quest, i) => {
                const poolA = Number(quest.pool_a) || 0;
                const poolB = Number(quest.pool_b) || 0;
                const total = poolA + poolB;
                const oddsA = total > 0 ? Math.round((poolA / total) * 100) : 50;
                const earlyBird = isEarlyBird(quest);
                const timeLeft = formatTimeRemaining(quest.betting_deadline);
                const isUrgent = timeLeft.includes('m') || timeLeft === 'Ended';
                
                return (
                  <Link key={quest.id} to={`/quests/${quest.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-dark-800 border border-white/5 rounded-2xl p-4 active:bg-dark-750 mb-1"
                    >
                      {/* Tags Row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] flex items-center gap-0.5">
                            <Bot size={8} /> Auto
                          </span>
                          <span className="px-1.5 py-0.5 bg-dark-700 text-dark-400 rounded text-[9px] capitalize">
                            {quest.category || 'crypto'}
                          </span>
                          {earlyBird && (
                            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-[9px]">
                              🐦 Early
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[10px] flex items-center gap-0.5 ${
                          isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-dark-700 text-dark-400'
                        }`}>
                          <Clock size={10} />
                          {timeLeft}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-medium text-white mb-3 line-clamp-2">{quest.title}</h3>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-[10px] text-dark-500 mb-3">
                        <span className="flex items-center gap-0.5">
                          <Users size={10} /> {quest.participant_count || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <TrendingUp size={10} /> {formatNumber(total)} pool
                        </span>
                      </div>

                      {/* Odds Bar */}
                      <div className="space-y-1.5">
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-400" 
                            style={{ width: `${oddsA}%` }} 
                          />
                          <div 
                            className="h-full bg-gradient-to-r from-red-400 to-red-500" 
                            style={{ width: `${100 - oddsA}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-green-400">{quest.option_a || 'Yes'} {oddsA}%</span>
                          <span className="text-red-400">{quest.option_b || 'No'} {100 - oddsA}%</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-dark-800 rounded-2xl p-8 border border-white/5 text-center">
              <Target size={40} className="text-dark-600 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">No predictions found</p>
              <p className="text-xs text-dark-500">
                {searchQuery ? 'Try a different search' : 'Check back later for new quests'}
              </p>
            </div>
          )
        ) : (
          // Social Pools List
          filteredPools.length > 0 ? (
            <div className="space-y-4">
              {filteredPools.map((pool, i) => (
                <SocialPoolCard key={pool.id} pool={pool} index={i} />
              ))}
            </div>
          ) : (
            <div className="bg-dark-800 rounded-2xl p-8 border border-white/5 text-center">
              <Users size={40} className="text-dark-600 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">No social pools yet</p>
              <p className="text-xs text-dark-500 mb-4">
                Be the first to create a prediction pool!
              </p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-purple-500 rounded-xl font-medium text-white"
              >
                Create Pool
              </motion.button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
