import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Copy, Check, Crown, LogIn } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { copyToClipboard } from '../utils/helpers';

export default function GroupsPage() {
  const { user } = useUserStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/miniapp/groups');
      setGroups(response.groups || []);
    } catch (error) { 
      console.error('Failed to fetch groups:', error);
      setGroups([]); 
    }
    finally { setIsLoading(false); }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) { showToast('Enter group name', 'error'); return; }
    setIsSubmitting(true);
    try {
      await api.post('/api/miniapp/groups', { name: groupName, description: groupDesc, is_private: isPrivate });
      telegram.hapticNotification('success');
      showToast('Group created!', 'success');
      setShowCreateModal(false);
      setGroupName(''); setGroupDesc(''); setIsPrivate(false);
      fetchGroups();
    } catch (error) { showToast(error.message || 'Failed', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) { showToast('Enter invite code', 'error'); return; }
    setIsSubmitting(true);
    try {
      await api.post('/api/miniapp/groups/join', { code: inviteCode });
      telegram.hapticNotification('success');
      showToast('Joined group!', 'success');
      setShowJoinModal(false);
      setInviteCode('');
      fetchGroups();
    } catch (error) { showToast(error.message || 'Invalid code', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleCopyCode = async (code) => {
    const success = await copyToClipboard(code);
    if (success) { setCopiedId(code); telegram.hapticNotification('success'); setTimeout(() => setCopiedId(null), 2000); }
  };
  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Delete "${groupName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/miniapp/groups/${groupId}`);
      telegram.hapticNotification('success');
      showToast('Group deleted', 'success');
      fetchGroups();
    } catch (error) {
      showToast(error.message || 'Failed to delete', 'error');
    }
  };


  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Users className="text-purple-400" size={24} />Groups</h1>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowJoinModal(true)} className="px-3 py-2 bg-dark-800 text-white rounded-xl font-medium flex items-center gap-1"><LogIn size={16} /></motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-purple-500 text-white rounded-xl font-medium flex items-center gap-2"><Plus size={18} /> New</motion.button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? ([...Array(3)].map((_, i) => (<div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse"><div className="h-5 bg-dark-700 rounded w-3/4 mb-2" /><div className="h-4 bg-dark-700 rounded w-1/2" /></div>))
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-4 text-dark-600" />
            <p className="text-dark-400 font-medium">No groups yet</p>
            <p className="text-sm text-dark-500 mt-1">Create or join a group!</p>
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={() => setShowJoinModal(true)} className="px-4 py-2 bg-dark-800 text-white rounded-xl">Join Group</button>
              <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-purple-500 text-white rounded-xl">Create Group</button>
            </div>
          </div>
        ) : (
          groups.map((group) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
              onClick={() => navigate(`/groups/${group.id}`)}
              className="bg-dark-800 rounded-xl p-4 border border-white/5 cursor-pointer hover:bg-dark-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{group.name}</h3>
                    {group.your_role === 'admin' && <Crown size={14} className="text-gold-400" />}
                  </div>
                  {group.description && <p className="text-sm text-dark-400 mt-1">{group.description}</p>}
                </div>
                <span className="text-xs text-dark-500">{group.member_count || 1} members</span>
              </div>
              {group.invite_code && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <span className="text-xs text-dark-400">Invite:</span>
                  <code className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">{group.invite_code}</code>
                  <button onClick={() => handleCopyCode(group.invite_code)} className="p-1 text-dark-400 hover:text-white">
                    {copiedId === group.invite_code ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-dark-900 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Create Group</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 text-dark-400"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Group Name</label>
                  <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="My Prediction Group" className="w-full bg-dark-800 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-2">Description (optional)</label>
                  <input type="text" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="Group for crypto predictions" className="w-full bg-dark-800 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="w-5 h-5 rounded bg-dark-800 border-dark-600" />
                  <span className="text-white">Private group</span>
                </label>
              </div>
              <button onClick={handleCreateGroup} disabled={isSubmitting || !groupName.trim()} className="w-full mt-6 py-3 bg-purple-500 disabled:bg-dark-700 disabled:text-dark-500 text-white font-bold rounded-xl">
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowJoinModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-dark-900 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Join Group</h3>
                <button onClick={() => setShowJoinModal(false)} className="p-1 text-dark-400"><X size={20} /></button>
              </div>
              <p className="text-dark-400 text-sm mb-4">Enter the invite code to join a private group.</p>
              <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="ENTER INVITE CODE" className="w-full bg-dark-800 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none text-center tracking-widest" maxLength={8} />
              <button onClick={handleJoinGroup} disabled={isSubmitting || !inviteCode.trim()} className="w-full mt-6 py-3 bg-purple-500 disabled:bg-dark-700 disabled:text-dark-500 text-white font-bold rounded-xl">
                {isSubmitting ? 'Joining...' : 'Join Group'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
