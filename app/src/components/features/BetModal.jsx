import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, TrendingUp } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useQuestStore } from '../../stores/questStore';
import { useUIStore } from '../../stores/uiStore';
import telegram from '../../services/telegram';
import { formatSatz, calculatePotentialWin, calculateOdds } from '../../utils/helpers';
import { LIMITS } from '../../utils/constants';

const quickAmounts = [100, 500, 1000, 5000];

export default function BetModal({ quest, option, onClose }) {
  const { user, deductBalance } = useUserStore();
  const { placeBet } = useQuestStore();
  const { showToast, showCelebration } = useUIStore();
  
  const [amount, setAmount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const balance = user?.satz_balance || 0;
  const maxBet = Math.max(0, balance - LIMITS.BALANCE_PROTECTION);
  
  const poolA = quest?.pool_a || 0;
  const poolB = quest?.pool_b || 0;
  const myPool = option === 'a' ? poolA : poolB;
  const otherPool = option === 'a' ? poolB : poolA;
  
  const potentialWin = calculatePotentialWin(amount, myPool, otherPool);
  const multiplier = potentialWin > 0 ? (potentialWin / amount).toFixed(2) : '0.00';
  const odds = calculateOdds(poolA, poolB);
  const myOdds = option === 'a' ? odds.a : odds.b;

  const optionText = option === 'a' ? quest?.option_a : quest?.option_b;

  const handleAmountChange = (newAmount) => {
    telegram.hapticSelection();
    const clampedAmount = Math.max(LIMITS.MIN_BET, Math.min(maxBet, newAmount));
    setAmount(clampedAmount);
  };

  const handleQuickAmount = (quickAmount) => {
    telegram.hapticImpact('light');
    handleAmountChange(quickAmount);
  };

  const handleIncrement = (step) => {
    handleAmountChange(amount + step);
  };

  const handleMaxBet = () => {
    telegram.hapticImpact('medium');
    handleAmountChange(maxBet);
  };

  const handleConfirm = async () => {
    if (amount < LIMITS.MIN_BET) {
      showToast(`Minimum bet is ${LIMITS.MIN_BET} SATZ`, 'error');
      return;
    }

    if (amount > maxBet) {
      showToast('Insufficient balance', 'error');
      return;
    }

    setIsLoading(true);
    telegram.hapticImpact('medium');

    try {
      await placeBet(quest.id, option, amount);
      deductBalance(amount);
      
      telegram.hapticNotification('success');
      showToast(`Bet placed! Good luck! 🍀`, 'success');
      onClose();
    } catch (error) {
      telegram.hapticNotification('error');
      showToast(error.message || 'Failed to place bet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 pt-8">
      {/* Header */}
      <h3 className="text-lg font-bold text-white mb-1">Place Your Bet</h3>
      <p className="text-dark-400 text-sm mb-6 line-clamp-2">{quest?.title}</p>

      {/* Selected option */}
      <div className={`p-4 rounded-xl mb-6 ${
        option === 'a' ? 'bg-mint-500/20 border border-mint-500/30' : 'bg-danger/20 border border-danger/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dark-400 text-xs mb-1">Your prediction</p>
            <p className="text-white font-semibold">{optionText}</p>
          </div>
          <div className="text-right">
            <p className="text-dark-400 text-xs mb-1">Current odds</p>
            <p className={`font-bold ${option === 'a' ? 'text-mint-400' : 'text-danger'}`}>
              {myOdds}%
            </p>
          </div>
        </div>
      </div>

      {/* Amount selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-dark-400 text-sm">Bet amount</span>
          <button 
            onClick={handleMaxBet}
            className="text-mint-400 text-sm font-medium"
          >
            Max: {formatSatz(maxBet)}
          </button>
        </div>

        <div className="flex items-center gap-3 bg-dark-800 rounded-xl p-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleIncrement(-100)}
            disabled={amount <= LIMITS.MIN_BET}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-dark-700 disabled:opacity-50"
          >
            <Minus size={18} className="text-white" />
          </motion.button>

          <div className="flex-1 text-center">
            <span className="text-2xl font-bold text-white">{formatSatz(amount)}</span>
            <span className="text-dark-400 ml-1">SATZ</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleIncrement(100)}
            disabled={amount >= maxBet}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-dark-700 disabled:opacity-50"
          >
            <Plus size={18} className="text-white" />
          </motion.button>
        </div>
      </div>

      {/* Quick amounts */}
      <div className="flex gap-2 mb-6">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            onClick={() => handleQuickAmount(quickAmount)}
            disabled={quickAmount > maxBet}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              amount === quickAmount
                ? 'bg-mint-500 text-white'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600 disabled:opacity-50'
            }`}
          >
            {formatSatz(quickAmount)}
          </button>
        ))}
      </div>

      {/* Potential winnings */}
      <div className="bg-dark-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-success" />
            <span className="text-dark-400">Potential win</span>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-success">
              {formatSatz(potentialWin)} SATZ
            </p>
            <p className="text-dark-400 text-sm">{multiplier}x multiplier</p>
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleConfirm}
        disabled={isLoading || amount < LIMITS.MIN_BET || amount > maxBet}
        className="btn-primary w-full"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            Placing bet...
          </span>
        ) : (
          `Bet ${formatSatz(amount)} SATZ`
        )}
      </motion.button>

      {/* Balance info */}
      <p className="text-center text-dark-400 text-sm mt-3">
        Balance after bet: {formatSatz(balance - amount)} SATZ
      </p>
    </div>
  );
}
