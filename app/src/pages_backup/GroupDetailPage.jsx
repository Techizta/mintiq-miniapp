import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Crown, Copy, Check, Trash2, UserPlus } from 'lucide-react';
import api from '../services/api';
import telegram from '../services/telegram';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/miniapp/groups/${groupId}`);
      setGroup(response.group);
      setMembers(response.members || []);
    } catch (error) {
      console.error('Failed to fetch group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (group?.invite_code) {
      await navigator.clipboard.writeText(group.invite_code);
      setCopied(true);
      telegram.hapticNotification('success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    telegram.hapticImpact('light');
    telegram.shareUrl(
      `https://t.me/MintIQBot?start=group_${group.invite_code}`,
      `🎯 Join my prediction group "${group.name}" on MintIQ!`
    );
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${group.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/miniapp/groups/${groupId}`);
      telegram.hapticNotification('success');
      navigate('/groups');
    } catch (error) {
      alert(error.message || 'Failed to delete');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4">
        <Users size={48} className="text-dark-600 mb-4" />
        <p className="text-dark-400">Group not found</p>
        <button onClick={() => navigate('/groups')} className="mt-4 text-purple-400">Go Back</button>
      </div>
    );
  }

  const isAdmin = group.your_role === 'admin';

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-dark-950/95 backdrop-blur-sm z-10 px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button onClick={() => navigate('/groups')} className="p-2 -ml-2 text-dark-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">{group.name}</h1>
        {isAdmin && (
          <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-300">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Group Info */}
      <div className="p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 rounded-xl p-4 border border-white/5">
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Users size={28} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{group.name}</h2>
              <p className="text-dark-400 text-sm">{members.length || group.member_count || 1} members</p>
            </div>
            {isAdmin && <Crown size={20} className="text-gold-400" />}
          </div>

          {group.description && (
            <p className="text-dark-300 text-sm mb-4">{group.description}</p>
          )}

          {/* Invite Code */}
          <div className="bg-dark-900 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-dark-400 mb-1">Invite Code</p>
                <code className="text-lg text-purple-400 font-mono font-bold">{group.invite_code}</code>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopyCode} className="p-2 bg-dark-800 rounded-lg text-dark-400 hover:text-white">
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
                <button onClick={handleShare} className="p-2 bg-purple-500 rounded-lg text-white">
                  <UserPlus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Share Button */}
          <button onClick={handleShare} className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            <UserPlus size={18} /> Invite Friends
          </button>
        </motion.div>
      </div>

      {/* Members */}
      <div className="px-4">
        <h3 className="text-sm font-medium text-dark-400 mb-3">Members</h3>
        <div className="bg-dark-800 rounded-xl border border-white/5 divide-y divide-white/5">
          {members.length > 0 ? members.map((member) => (
            <div key={member.user_id} className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center text-white font-bold">
                {member.first_name?.[0] || '?'}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{member.first_name} {member.last_name || ''}</p>
                <p className="text-xs text-dark-400">@{member.username || 'anonymous'}</p>
              </div>
              {member.role === 'admin' && <Crown size={14} className="text-gold-400" />}
            </div>
          )) : (
            <div className="p-4 text-center text-dark-400">
              <p>No members yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
