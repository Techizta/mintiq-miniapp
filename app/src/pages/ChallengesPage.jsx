import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Plus, Trophy, Clock, X, Users, ChevronRight } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, formatRelativeTime } from '../utils/helpers';

export default function ChallengesPage() {
  const { user, fetchUser } = useUserStore();
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('pending');
  const [challenges, setChallenges] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [stakeAmount, setStakeAmount] = useState(50);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => { fetchChallenges(); fetchFriends(); }, [activeTab]);

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/miniapp/challenges?status=${activeTab}`);
      setChallenges(response.challenges || []);
    } catch (error) { setChallenges([]); }
    finally { setIsLoading(false); }
  };

  const fetchFriends = async () => {
    try {
      const response = await api.get('/api/miniapp/friends');
      setFriends(response.friends || []);
    } catch (error) { setFriends([]); }
  };

  const handleCreateChallenge = async () => {
    if (!selectedFriend || !challengeTitle || stakeAmount < 10) { showToast('Please fill all fields', 'error'); return; }
    if ((user?.satz_balance || 0) < stakeAmount) { showToast('Insufficient balance', 'error'); return; }
    setIsCreating(true);
    try {
      await api.post('/api/miniapp/challenges', { title: challengeTitle, stake_amount: stakeAmount, challenged_id: selectedFriend.id });
      telegram.hapticNotification('success');
      showToast('Challenge sent!', 'success');
      setShowCreateModal(false);
      setChallengeTitle(''); setSelectedFriend(null); setStakeAmount(50);
      fetchChallenges(); fetchUser(true);
    } catch (error) { showToast(error.message || 'Failed', 'error'); }
    finally { setIsCreating(false); }
  };

  const handleAccept = async (id) => {
    try { await api.post(`/api/miniapp/challenges/${id}/accept`); showToast('Accepted!', 'success'); fetchChallenges(); fetchUser(true); }
    catch (error) { showToast('Failed', 'error'); }
  };

  const handleDecline = async (id) => {
    try { await api.post(`/api/miniapp/challenges/${id}/decline`); showToast('Declined', 'info'); fetchChallenges(); }
    catch (error) { showToast('Failed', 'error'); }
  };

  const tabs = [{ id: 'pending', label: 'Pending' }, { id: 'active', label: 'Active' }, { id: 'completed', label: 'History' }];

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="text-orange-400" size={24} />Challenges</h1>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium flex items-center gap-2"><Plus size={18} /> New</motion.button>
        </div>
        <div className="flex bg-dark-800 rounded-xl p-1">
          {tabs.map((tab) => (<button key={tab.id} onClick={() => { telegram.hapticSelection(); setActiveTab(tab.id); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'text-dark-400'}`}>{tab.label}</button>))}
        </div>
      </div>
      <div className="p-4 space-y-3">
        {isLoading ? ([...Array(3)].map((_, i) => (<div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse"><div className="h-5 bg-dark-700 rounded w-3/4 mb-2" /><div className="h-4 bg-dark-700 rounded w-1/2" /></div>))
        ) : challenges.length === 0 ? (
          <div className="text-center py-12"><Zap size={48} className="mx-auto mb-4 text-dark-600" /><p className="text-dark-400 font-medium">No {activeTab} challenges</p><p className="text-sm text-dark-500 mt-1">Create a challenge to battle friends!</p></div>
        ) : (challenges.map((c) => {
          const isChallenger = c.challenger?.id === user?.id || c.challenger_id === user?.id;
          const opponent = isChallenger ? c.challenged : c.challenger;
          const canRespond = c.status === 'pending' && !isChallenger;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-800 rounded-xl p-4 border border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1"><h3 className="font-semibold text-white">{c.title}</h3><p className="text-sm text-dark-400 mt-1">{isChallenger ? 'You challenged' : 'Challenged by'} <span className="text-mint-400">@{opponent?.username || opponent?.first_name || 'User'}</span></p></div>
                <div className="text-right"><p className="text-lg font-bold text-gold-400">{formatSatz(c.stake_amount)}</p><p className="text-xs text-dark-500">SATZ</p></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-500 flex items-center gap-1"><Clock size={12} />{formatRelativeTime(c.created_at)}</span>
                {canRespond ? (<div className="flex gap-2"><button onClick={() => handleDecline(c.id)} className="px-4 py-1.5 bg-dark-700 text-dark-300 rounded-lg text-sm">Decline</button><button onClick={() => handleAccept(c.id)} className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm">Accept</button></div>
                ) : (<span className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : c.status === 'active' ? 'bg-mint-500/20 text-mint-400' : 'bg-dark-700 text-dark-400'}`}>{c.status === 'pending' && isChallenger ? 'Waiting...' : c.status}</span>)}
              </div>
            </motion.div>
          );
        }))}
      </div>
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-dark-900 rounded-t-3xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10"><h3 className="text-lg font-bold text-white">Create Challenge</h3><button onClick={() => setShowCreateModal(false)} className="p-2 text-dark-400"><X size={20} /></button></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div><label className="block text-sm text-dark-400 mb-2">Challenge Title</label><input type="text" value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} placeholder="e.g., BTC hits $100K" className="w-full bg-dark-800 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50" /></div>
                <div><label className="block text-sm text-dark-400 mb-2">Stake Amount</label><div className="flex gap-2">{[25, 50, 100, 250].map((amt) => (<button key={amt} onClick={() => setStakeAmount(amt)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${stakeAmount === amt ? 'bg-orange-500 text-white' : 'bg-dark-800 text-dark-400'}`}>{amt}</button>))}</div><p className="text-xs text-dark-500 mt-2">Balance: {formatSatz(user?.satz_balance || 0)} SATZ</p></div>
                <div><label className="block text-sm text-dark-400 mb-2">Challenge Friend</label>{friends.length === 0 ? (<div className="bg-dark-800 rounded-xl p-4 text-center"><Users size={24} className="mx-auto mb-2 text-dark-500" /><p className="text-dark-400 text-sm">No friends yet</p></div>) : (<div className="space-y-2 max-h-40 overflow-y-auto">{friends.map((f) => (<button key={f.id} onClick={() => setSelectedFriend(f)} className={`w-full flex items-center gap-3 p-3 rounded-xl ${selectedFriend?.id === f.id ? 'bg-orange-500/20 border border-orange-500/50' : 'bg-dark-800 border border-transparent'}`}><div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-white font-medium">{f.first_name?.[0] || '?'}</div><div className="flex-1 text-left"><p className="font-medium text-white">{f.first_name || f.username}</p></div>{selectedFriend?.id === f.id && <ChevronRight size={14} className="text-orange-400" />}</button>))}</div>)}</div>
              </div>
              <div className="p-4 border-t border-white/10"><button onClick={handleCreateChallenge} disabled={isCreating || !selectedFriend || !challengeTitle || (user?.satz_balance || 0) < stakeAmount} className="w-full py-3 bg-orange-500 disabled:bg-dark-700 disabled:text-dark-500 text-white font-bold rounded-xl">{isCreating ? 'Creating...' : `Send Challenge (${stakeAmount} SATZ)`}</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
