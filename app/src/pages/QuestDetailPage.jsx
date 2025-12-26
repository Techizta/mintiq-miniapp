/**
 * MintIQ QuestDetailPage - REDESIGNED
 * 
 * Key Changes:
 * - Larger option buttons
 * - USD values everywhere
 * - Better potential win display
 * - First prediction bonus visible
 * - Smoother betting flow
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  TrendingUp, 
  Share2, 
  Lock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { 
  formatSatz, 
  formatTimeRemaining, 
  calculateOdds, 
  calculateMultiplier, 
  calculatePotentialWin,
  satzUsdValue,
  formatSatzWithUsd,
  getCategoryEmoji
} from '../utils/helpers';

// ============================================
// CONSTANTS
// ============================================

const BET_AMOUNTS = [25, 50, 100, 250, 500];
const MIN_BET = 10;
const FIRST_PREDICTION_BONUS = 100;

export default function QuestDetailPage() {
  const { questId: id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, fetchUser } = useUserStore();
  const { showToast, showCelebration } = useUIStore();
  
  // State
  const [quest, setQuest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [betAmount, setBetAmount] = useState(50);
  const [isPlacing, setIsPlacing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [btcPrice, setBtcPrice] = useState(100000);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => { 
    fetchQuest();
    fetchBtcPrice();
    
    // Check if option was passed in URL
    const urlOption = searchParams.get('option');
    if (urlOption === 'a' || urlOption === 'b') {
      setSelectedOption(urlOption);
    }
  }, [id]);

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
  
  const fetchBtcPrice = async () => {
    try {
      const response = await api.get('/api/miniapp/public/stats');
      if (response?.btcPrice) setBtcPrice(response.btcPrice);
    } catch (e) {}
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handlePlaceBet = async () => {
    if (!selectedOption || betAmount < MIN_BET) {
      showToast('Select an option and amount', 'error');
      return;
    }
    if ((user?.satz_balance || 0) < betAmount) {
      showToast('Insufficient balance', 'error');
      return;
    }
    
    telegram.hapticImpact('medium');
    setIsPlacing(true);
    
    try {
      const response = await api.post(`/api/miniapp/quests/${id}/bet`, { 
        option: selectedOption, 
        amount: betAmount 
      });
      
      telegram.hapticNotification('success');
      
      // Show celebration
      showCelebration('bet', {
        amount: betAmount,
        option: selectedOption === 'a' ? quest.option_a : quest.option_b,
        potentialWin: potentialWin,
        isFirstPrediction: isFirstPrediction
      });
      
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
    telegram.hapticSelection();
    telegram.shareUrl(
      `https://t.me/MintIQBot?start=quest_${id}`,
      `🎯 ${quest?.title}\n\nPredict now on MintIQ!`
    );
  };

  const handleOptionSelect = (option) => {
    if (!canBet) return;
    telegram.hapticSelection();
    setSelectedOption(option);
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const odds = useMemo(() => {
    if (!quest) return { a: 50, b: 50 };
    return calculateOdds(quest.pool_a, quest.pool_b);
  }, [quest]);

  const totalPool = useMemo(() => {
    if (!quest) return 0;
    return (Number(quest.pool_a) || 0) + (Number(quest.pool_b) || 0);
  }, [quest]);

  const isExpired = quest ? new Date(quest.betting_deadline) <= new Date() : false;
  const isResolved = quest?.status === 'resolved';
  const hasBet = quest?.userBet !== null;
  const canBet = !isExpired && !isResolved && !hasBet;
  
  const isFirstPrediction = !user?.first_prediction_bonus_claimed && (user?.predictions_made || 0) === 0;

  const multiplierA = useMemo(() => {
    if (!quest) return 1;
    return calculateMultiplier(Number(quest.pool_a) || 0, Number(quest.pool_b) || 0);
  }, [quest]);

  const multiplierB = useMemo(() => {
    if (!quest) return 1;
    return calculateMultiplier(Number(quest.pool_b) || 0, Number(quest.pool_a) || 0);
  }, [quest]);

  const potentialWin = useMemo(() => {
    if (!quest || !selectedOption) return 0;
    const myPool = selectedOption === 'a' ? Number(quest.pool_a) || 0 : Number(quest.pool_b) || 0;
    const otherPool = selectedOption === 'a' ? Number(quest.pool_b) || 0 : Number(quest.pool_a) || 0;
    return calculatePotentialWin(betAmount, myPool, otherPool);
  }, [quest, selectedOption, betAmount]);

  // ============================================
  // RENDER: LOADING
  // ============================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-800 rounded w-1/4" />
          <div className="h-6 bg-dark-800 rounded w-3/4" />
          <div className="h-40 bg-dark-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!quest) return null;

  // ============================================
  // RENDER: MAIN
  // ============================================

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-dark-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Prediction</h1>
        </div>
        <button 
          onClick={handleShare}
          className="p-2 text-dark-400 hover:text-white transition-colors"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 pb-44 space-y-4">
        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 bg-dark-800 text-dark-300 rounded-full text-xs capitalize flex items-center gap-1">
            {getCategoryEmoji(quest.category)} {quest.category || 'crypto'}
          </span>
          
          {isExpired && !isResolved && (
            <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1">
              <Clock size={10} /> Pending Result
            </span>
          )}
          {isResolved && (
            <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
              ✓ Resolved
            </span>
          )}
          {hasBet && (
            <span className="px-2.5 py-1 bg-mint-500/20 text-mint-400 rounded-full text-xs">
              🎯 You predicted: {quest.userBet.chosen_option === 'a' ? quest.option_a : quest.option_b}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-xl font-bold text-white mb-2">{quest.title}</h2>
          {quest.description && (
            <p className="text-sm text-dark-400">{quest.description}</p>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-dark-400">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {isExpired ? 'Ended' : formatTimeRemaining(quest.betting_deadline)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} />
            {quest.participant_count || 0} players
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp size={14} className="text-gold-400" />
            {formatSatzWithUsd(totalPool, btcPrice)} pool
          </span>
        </div>

        {/* First Prediction Bonus */}
        {isFirstPrediction && canBet && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-mint-500/10 to-cyan-500/10 border border-mint-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mint-500/20 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-mint-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">First Prediction Bonus!</p>
                <p className="text-xs text-dark-400">Earn extra SATZ on your first bet</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-mint-400">+{FIRST_PREDICTION_BONUS}</p>
                <p className="text-xs text-dark-500">SATZ</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Options */}
        <div className="space-y-3">
          <h3 className="font-medium text-white">Choose your prediction</h3>
          
          {/* Option A */}
          <motion.button
            whileTap={canBet ? { scale: 0.98 } : {}}
            onClick={() => handleOptionSelect('a')}
            disabled={!canBet}
            className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
              selectedOption === 'a' 
                ? 'bg-mint-500/20 border-mint-500' 
                : hasBet && quest.userBet?.chosen_option === 'a' 
                ? 'bg-mint-500/10 border-mint-500/50' 
                : 'bg-dark-800 border-transparent hover:border-dark-600'
            } ${!canBet && 'opacity-60 cursor-not-allowed'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white text-lg">{quest.option_a || 'Yes'}</span>
              <span className="text-3xl font-black text-mint-400">{odds.a}%</span>
            </div>
            <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden mb-3">
              <motion.div 
                className="h-full bg-gradient-to-r from-mint-500 to-mint-400 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${odds.a}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">{formatSatz(Number(quest.pool_a) || 0)} SATZ</span>
              <span className="text-mint-400 font-medium">
                {multiplierA.toFixed(2)}x potential
              </span>
            </div>
          </motion.button>

          {/* Option B */}
          <motion.button
            whileTap={canBet ? { scale: 0.98 } : {}}
            onClick={() => handleOptionSelect('b')}
            disabled={!canBet}
            className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
              selectedOption === 'b' 
                ? 'bg-red-500/20 border-red-500' 
                : hasBet && quest.userBet?.chosen_option === 'b' 
                ? 'bg-red-500/10 border-red-500/50' 
                : 'bg-dark-800 border-transparent hover:border-dark-600'
            } ${!canBet && 'opacity-60 cursor-not-allowed'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white text-lg">{quest.option_b || 'No'}</span>
              <span className="text-3xl font-black text-red-400">{odds.b}%</span>
            </div>
            <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden mb-3">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${odds.b}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">{formatSatz(Number(quest.pool_b) || 0)} SATZ</span>
              <span className="text-red-400 font-medium">
                {multiplierB.toFixed(2)}x potential
              </span>
            </div>
          </motion.button>
        </div>

        {/* Bet Amount Selector */}
        <AnimatePresence>
          {canBet && selectedOption && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <h3 className="font-medium text-white">Bet Amount</h3>
              
              {/* Quick amounts */}
              <div className="flex gap-2">
                {BET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      telegram.hapticSelection();
                      setBetAmount(amt);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      betAmount === amt 
                        ? 'bg-mint-500 text-white' 
                        : 'bg-dark-800 text-dark-400 hover:text-white'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
              
              {/* Custom input */}
              <div className="relative">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(MIN_BET, parseInt(e.target.value) || MIN_BET))}
                  className="w-full bg-dark-800 rounded-xl px-4 py-3.5 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-mint-500/50"
                  min={MIN_BET}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 text-sm">
                  SATZ
                </span>
              </div>
              
              {/* Balance info */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">Your balance:</span>
                <span className="text-white font-medium">
                  {formatSatzWithUsd(user?.satz_balance || 0, btcPrice)}
                </span>
              </div>
              
              {/* Potential Win Display */}
              <div className="bg-gradient-to-r from-gold-500/10 to-orange-500/10 border border-gold-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-400 mb-1">Potential Win</p>
                    <p className="text-2xl font-bold text-gold-400">
                      {formatSatz(potentialWin)} <span className="text-lg">SATZ</span>
                    </p>
                    <p className="text-sm text-dark-500">
                      {satzUsdValue(potentialWin, btcPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dark-500">Multiplier</p>
                    <p className="text-xl font-bold text-white">
                      {(potentialWin / betAmount).toFixed(2)}x
                    </p>
                  </div>
                </div>
                
                {isFirstPrediction && (
                  <div className="mt-3 pt-3 border-t border-gold-500/20 flex items-center justify-between">
                    <span className="text-sm text-mint-400">+ First Prediction Bonus</span>
                    <span className="text-sm font-bold text-mint-400">+{FIRST_PREDICTION_BONUS} SATZ</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User's Existing Bet */}
        {hasBet && (
          <div className="bg-mint-500/10 border border-mint-500/30 rounded-xl p-4">
            <h3 className="font-medium text-mint-400 mb-3">Your Prediction</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Option:</span>
                <span className="text-white font-medium">
                  {quest.userBet.chosen_option === 'a' ? quest.option_a : quest.option_b}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Amount:</span>
                <span className="text-white font-medium">
                  {formatSatzWithUsd(quest.userBet.amount, btcPrice)}
                </span>
              </div>
              {quest.userBet.potential_payout && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Potential Win:</span>
                  <span className="text-gold-400 font-medium">
                    {formatSatzWithUsd(quest.userBet.potential_payout, btcPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quest Details (Collapsible) */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between bg-dark-800 rounded-xl p-4"
        >
          <span className="font-medium text-white">Quest Details</span>
          {showDetails ? <ChevronUp size={18} className="text-dark-400" /> : <ChevronDown size={18} className="text-dark-400" />}
        </button>
        
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-dark-800 rounded-xl p-4 space-y-2 text-sm"
            >
              <div className="flex justify-between">
                <span className="text-dark-400">Total Pool</span>
                <span className="text-white">{formatSatzWithUsd(totalPool, btcPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Participants</span>
                <span className="text-white">{quest.participant_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Status</span>
                <span className={isExpired ? 'text-yellow-400' : 'text-mint-400'}>
                  {isResolved ? 'Resolved' : isExpired ? 'Awaiting Result' : 'Active'}
                </span>
              </div>
              {isResolved && quest.winning_option && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Winner</span>
                  <span className="text-gold-400 font-medium">
                    {quest.winning_option === 'a' ? quest.option_a : quest.option_b}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-dark-400">Deadline</span>
                <span className="text-white">
                  {new Date(quest.betting_deadline).toLocaleString()}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-dark-900/95 backdrop-blur-lg border-t border-white/5 p-4 z-50">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button 
            onClick={handleShare} 
            className="px-5 py-3.5 bg-dark-800 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-dark-750 transition-colors"
          >
            <Share2 size={18} /> Share
          </button>
          
          {canBet ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceBet}
              disabled={!selectedOption || isPlacing || (user?.satz_balance || 0) < betAmount}
              className={`flex-1 py-3.5 font-bold rounded-xl transition-all ${
                selectedOption && (user?.satz_balance || 0) >= betAmount
                  ? 'bg-gradient-to-r from-mint-500 to-cyan-500 text-white'
                  : 'bg-dark-700 text-dark-500 cursor-not-allowed'
              }`}
            >
              {isPlacing 
                ? 'Placing...' 
                : selectedOption 
                ? `Predict ${formatSatz(betAmount)} SATZ` 
                : 'Select an Option'
              }
            </motion.button>
          ) : (
            <div className="flex-1 py-3.5 bg-dark-800 text-dark-400 font-medium rounded-xl text-center flex items-center justify-center gap-2">
              {isResolved 
                ? '✓ Resolved' 
                : hasBet 
                ? '✓ Prediction Placed' 
                : <><Lock size={16} /> Betting Closed</>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
