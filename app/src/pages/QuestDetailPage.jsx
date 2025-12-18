import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, TrendingUp, Share2, Lock } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, formatTimeRemaining, calculateOdds, calculateMultiplier, calculatePotentialWin } from '../utils/helpers';

export default function QuestDetailPage() {
  const { questId: id } = useParams();
  const navigate = useNavigate();
  const { user, fetchUser } = useUserStore();
  const { showToast } = useUIStore();
  
  const [quest, setQuest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [betAmount, setBetAmount] = useState(50);
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => { fetchQuest(); }, [id]);

  const fetchQuest = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/miniapp/quests/${id}`);
      setQuest(response.quest);
    } catch (error) {
      showToast('Quest not found', 'error');
      navigate('/predict');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceBet = async () => {
    if (!selectedOption || betAmount < 10) {
      showToast('Select an option and amount', 'error');
      return;
    }
    if ((user?.satz_balance || 0) < betAmount) {
      showToast('Insufficient balance', 'error');
      return;
    }
    setIsPlacing(true);
    try {
      await api.post(`/api/miniapp/quests/${id}/bet`, { option: selectedOption, amount: betAmount });
      telegram.hapticNotification('success');
      showToast('Bet placed!', 'success');
      fetchUser(true);
      fetchQuest();
    } catch (error) {
      showToast(error.message || 'Failed to place bet', 'error');
      telegram.hapticNotification('error');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleShare = () => {
    telegram.shareUrl(`https://t.me/MintIQBot?start=quest_${id}`, `🎯 ${quest?.title}\n\nPredict now on MintIQ!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-800 rounded w-1/4" />
          <div className="h-6 bg-dark-800 rounded w-3/4" />
          <div className="h-32 bg-dark-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!quest) return null;

  const odds = calculateOdds(quest.pool_a, quest.pool_b);
  const totalPool = (Number(quest.pool_a) || 0) + (Number(quest.pool_b) || 0);
  const isExpired = new Date(quest.betting_deadline) <= new Date();
  const isResolved = quest.status === 'resolved';
  const hasBet = quest.userBet !== null;
  const canBet = !isExpired && !isResolved && !hasBet;
  const multiplierA = calculateMultiplier(Number(quest.pool_a) || 0, Number(quest.pool_b) || 0);
  const multiplierB = calculateMultiplier(Number(quest.pool_b) || 0, Number(quest.pool_a) || 0);

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-dark-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-white">Quest</h1>
      </div>

      {/* Content - with extra bottom padding for fixed bar */}
      <div className="p-4 pb-40 space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {isExpired && !isResolved && (
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
              <Lock size={12} /> Betting Closed
            </span>
          )}
          {isResolved && <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">✓ Resolved</span>}
          {hasBet && (
            <span className="px-3 py-1 bg-mint-500/20 text-mint-400 rounded-full text-xs">
              You bet: {quest.userBet.chosen_option === 'a' ? quest.option_a : quest.option_b}
            </span>
          )}
          <span className="px-3 py-1 bg-dark-800 text-dark-400 rounded-full text-xs capitalize">{quest.category}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white">{quest.title}</h2>
        {quest.description && <p className="text-dark-400">{quest.description}</p>}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-dark-400">
          <span className="flex items-center gap-1"><Clock size={14} />{isExpired ? 'Ended' : formatTimeRemaining(quest.betting_deadline)}</span>
          <span className="flex items-center gap-1"><Users size={14} />{quest.participant_count || 0} players</span>
          <span className="flex items-center gap-1"><TrendingUp size={14} className="text-gold-400" />{formatSatz(totalPool)} pool</span>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <h3 className="font-medium text-white">Choose your prediction</h3>
          
          {/* Option A */}
          <motion.button
            whileTap={canBet ? { scale: 0.98 } : {}}
            onClick={() => canBet && setSelectedOption('a')}
            disabled={!canBet}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedOption === 'a' ? 'bg-mint-500/20 border-mint-500' :
              hasBet && quest.userBet?.chosen_option === 'a' ? 'bg-mint-500/10 border-mint-500/50' :
              'bg-dark-800 border-transparent hover:border-dark-600'
            } ${!canBet && 'opacity-60'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">{quest.option_a || 'Yes'}</span>
              <span className="text-2xl font-black text-mint-400">{odds.a}%</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-mint-500 to-mint-400" style={{ width: `${odds.a}%` }} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">{formatSatz(Number(quest.pool_a) || 0)} SATZ</span>
              <span className="text-mint-400">Potential: {multiplierA.toFixed(2)}x</span>
            </div>
          </motion.button>

          {/* Option B */}
          <motion.button
            whileTap={canBet ? { scale: 0.98 } : {}}
            onClick={() => canBet && setSelectedOption('b')}
            disabled={!canBet}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedOption === 'b' ? 'bg-red-500/20 border-red-500' :
              hasBet && quest.userBet?.chosen_option === 'b' ? 'bg-red-500/10 border-red-500/50' :
              'bg-dark-800 border-transparent hover:border-dark-600'
            } ${!canBet && 'opacity-60'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">{quest.option_b || 'No'}</span>
              <span className="text-2xl font-black text-red-400">{odds.b}%</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-400" style={{ width: `${odds.b}%` }} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">{formatSatz(Number(quest.pool_b) || 0)} SATZ</span>
              <span className="text-red-400">Potential: {multiplierB.toFixed(2)}x</span>
            </div>
          </motion.button>
        </div>

        {/* Bet Amount - show if can bet and option selected */}
        {canBet && selectedOption && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <h3 className="font-medium text-white">Bet Amount</h3>
            <div className="flex gap-2">
              {[25, 50, 100, 250].map((amt) => (
                <button key={amt} onClick={() => setBetAmount(amt)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${betAmount === amt ? 'bg-mint-500 text-white' : 'bg-dark-800 text-dark-400'}`}>{amt}</button>
              ))}
            </div>
            <input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 0))} className="w-full bg-dark-800 rounded-xl px-4 py-3 text-white text-center focus:outline-none" min={10} />
            <p className="text-xs text-dark-500 text-center">Balance: {formatSatz(user?.satz_balance || 0)} SATZ</p>
            <div className="bg-dark-800 rounded-xl p-3 text-center">
              <p className="text-sm text-dark-400">Potential Win</p>
              <p className="text-2xl font-bold text-gold-400">
                {formatSatz(calculatePotentialWin(betAmount, selectedOption === 'a' ? Number(quest.pool_a) || 0 : Number(quest.pool_b) || 0, selectedOption === 'a' ? Number(quest.pool_b) || 0 : Number(quest.pool_a) || 0))} SATZ
              </p>
            </div>
          </motion.div>
        )}

        {/* User's bet info */}
        {hasBet && (
          <div className="bg-mint-500/10 border border-mint-500/30 rounded-xl p-4">
            <h3 className="font-medium text-mint-400 mb-2">Your Bet</h3>
            <div className="flex justify-between text-sm"><span className="text-dark-400">Option:</span><span className="text-white">{quest.userBet.chosen_option === 'a' ? quest.option_a : quest.option_b}</span></div>
            <div className="flex justify-between text-sm"><span className="text-dark-400">Amount:</span><span className="text-white">{formatSatz(quest.userBet.amount)} SATZ</span></div>
          </div>
        )}

        {/* Quest Details */}
        <div className="bg-dark-800 rounded-xl p-4">
          <h3 className="font-medium text-white mb-3">Quest Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-dark-400">Total Pool</span><span className="text-white">{formatSatz(totalPool)} SATZ</span></div>
            <div className="flex justify-between"><span className="text-dark-400">Participants</span><span className="text-white">{quest.participant_count || 0}</span></div>
            <div className="flex justify-between"><span className="text-dark-400">Status</span><span className={isExpired ? 'text-red-400' : 'text-mint-400'}>{isResolved ? 'Resolved' : isExpired ? 'Closed' : 'Active'}</span></div>
            {isResolved && quest.winning_option && (<div className="flex justify-between"><span className="text-dark-400">Winner</span><span className="text-gold-400">{quest.winning_option === 'a' ? quest.option_a : quest.option_b}</span></div>)}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar - ABOVE tab bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-dark-900 border-t border-white/5 p-4 z-50">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button onClick={handleShare} className="px-5 py-3 bg-dark-800 text-white rounded-xl font-medium flex items-center gap-2">
            <Share2 size={18} /> Share
          </button>
          
          {canBet ? (
            <button
              onClick={handlePlaceBet}
              disabled={!selectedOption || isPlacing || (user?.satz_balance || 0) < betAmount}
              className="flex-1 py-3 bg-gradient-to-r from-mint-500 to-cyan-500 disabled:from-dark-700 disabled:to-dark-700 text-white font-bold rounded-xl disabled:text-dark-500"
            >
              {isPlacing ? 'Placing...' : selectedOption ? `Place Bet (${betAmount} SATZ)` : 'Select Option'}
            </button>
          ) : (
            <div className="flex-1 py-3 bg-dark-800 text-dark-400 font-medium rounded-xl text-center flex items-center justify-center gap-2">
              {isResolved ? '✓ Resolved' : hasBet ? '✓ Bet Placed' : <><Lock size={16} /> Closed</>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
