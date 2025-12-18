import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Check, X, Copy, Share2, Search } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, copyToClipboard, getTierInfo } from '../utils/helpers';

export default function FriendsPage() {
  const { user } = useUserStore();
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'friends') {
        const response = await api.get('/api/miniapp/friends');
        setFriends(response.friends || []);
      } else {
        const response = await api.get('/api/miniapp/friends/requests');
        setRequests(response.requests || []);
      }
    } catch (error) { setFriends([]); setRequests([]); }
    finally { setIsLoading(false); }
  };

  const handleAddFriend = async () => {
    if (!searchUsername.trim()) { showToast('Enter a username', 'error'); return; }
    setIsAdding(true);
    try {
      await api.post('/api/miniapp/friends/add', { username: searchUsername });
      telegram.hapticNotification('success');
      showToast('Friend request sent!', 'success');
      setShowAddModal(false); setSearchUsername('');
    } catch (error) { showToast(error.message || 'Failed', 'error'); }
    finally { setIsAdding(false); }
  };

  const handleAccept = async (id) => { try { await api.post(`/api/miniapp/friends/${id}/accept`); showToast('Added!', 'success'); fetchData(); } catch (e) { showToast('Failed', 'error'); } };
  const handleDecline = async (id) => { try { await api.post(`/api/miniapp/friends/${id}/decline`); showToast('Declined', 'info'); fetchData(); } catch (e) { showToast('Failed', 'error'); } };

  const handleCopyReferral = async () => {
    const success = await copyToClipboard(`https://t.me/MintIQBot?start=ref_${user?.id}`);
    if (success) { setCopied(true); telegram.hapticNotification('success'); setTimeout(() => setCopied(false), 2000); }
  };

  const handleShare = () => { telegram.shareUrl(`https://t.me/MintIQBot?start=ref_${user?.id}`, '🎯 Join MintIQ! Get 500 SATZ free!'); };

  const tabs = [{ id: 'friends', label: 'Friends', count: friends.length }, { id: 'requests', label: 'Requests', count: requests.length }];

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Users className="text-cyan-400" size={24} />Friends</h1>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-medium flex items-center gap-2"><UserPlus size={18} /> Add</motion.button>
        </div>
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-purple-300 mb-1">🚀 Invite & Earn</p><p className="text-white font-bold">50 SATZ + 7% forever</p></div>
            <div className="flex gap-2">
              <button onClick={handleCopyReferral} className="px-3 py-2 bg-purple-500/30 text-white rounded-lg">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
              <button onClick={handleShare} className="px-3 py-2 bg-purple-500 text-white rounded-lg flex items-center gap-1"><Share2 size={16} /> Share</button>
            </div>
          </div>
        </div>
        <div className="flex bg-dark-800 rounded-xl p-1">
          {tabs.map((tab) => (<button key={tab.id} onClick={() => { telegram.hapticSelection(); setActiveTab(tab.id); }} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-cyan-500 text-white' : 'text-dark-400'}`}>{tab.label}{tab.count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-dark-700'}`}>{tab.count}</span>}</button>))}
        </div>
      </div>
      <div className="p-4 space-y-3">
        {isLoading ? ([...Array(3)].map((_, i) => (<div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse flex items-center gap-3"><div className="w-12 h-12 bg-dark-700 rounded-full" /><div className="flex-1"><div className="h-4 bg-dark-700 rounded w-1/2 mb-2" /><div className="h-3 bg-dark-700 rounded w-1/3" /></div></div>))
        ) : activeTab === 'friends' ? (
          friends.length === 0 ? (<div className="text-center py-12"><Users size={48} className="mx-auto mb-4 text-dark-600" /><p className="text-dark-400 font-medium">No friends yet</p><p className="text-sm text-dark-500 mt-1">Add friends to challenge them!</p></div>
          ) : (friends.map((f) => { const t = getTierInfo(f.tier); return (<div key={f.id} className="bg-dark-800 rounded-xl p-4 flex items-center gap-3"><div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: t.color + '33', color: t.color }}>{f.first_name?.[0] || f.username?.[0] || '?'}</div><div className="flex-1"><p className="font-medium text-white">{f.first_name || f.username}</p><div className="flex items-center gap-2 text-xs"><span className="text-dark-400">@{f.username || 'user'}</span><span className="px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: t.color + '33', color: t.color }}>{t.name}</span></div></div><div className="text-right text-sm"><p className="text-white font-medium">{f.predictions_won || 0}</p><p className="text-dark-500 text-xs">wins</p></div></div>); }))
        ) : (
          requests.length === 0 ? (<div className="text-center py-12"><UserPlus size={48} className="mx-auto mb-4 text-dark-600" /><p className="text-dark-400 font-medium">No pending requests</p></div>
          ) : (requests.map((r) => (<div key={r.id} className="bg-dark-800 rounded-xl p-4 flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-lg font-bold text-white">{r.first_name?.[0] || '?'}</div><div className="flex-1"><p className="font-medium text-white">{r.first_name || r.username}</p><p className="text-xs text-dark-400">@{r.username || 'user'}</p></div><div className="flex gap-2"><button onClick={() => handleDecline(r.id)} className="p-2 bg-dark-700 text-dark-400 rounded-lg"><X size={18} /></button><button onClick={() => handleAccept(r.id)} className="p-2 bg-cyan-500 text-white rounded-lg"><Check size={18} /></button></div></div>)))
        )}
      </div>
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-dark-900 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Add Friend</h3>
              <div className="relative mb-4"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" /><input type="text" value={searchUsername} onChange={(e) => setSearchUsername(e.target.value)} placeholder="Enter username..." className="w-full bg-dark-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none" /></div>
              <div className="flex gap-3"><button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-dark-800 text-dark-300 font-medium rounded-xl">Cancel</button><button onClick={handleAddFriend} disabled={isAdding || !searchUsername.trim()} className="flex-1 py-3 bg-cyan-500 disabled:bg-dark-700 disabled:text-dark-500 text-white font-medium rounded-xl">{isAdding ? 'Adding...' : 'Add Friend'}</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
