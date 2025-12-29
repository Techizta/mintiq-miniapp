import { motion } from 'framer-motion';
import { Trophy, TrendingDown, Share2 } from 'lucide-react';
import telegram from '../../services/telegram';
import { formatSatz } from '../../utils/helpers';
import { ShareWinButton } from './ShareButton';

export default function ResultModal({ 
  isWin, 
  amount, 
  questTitle, 
  questId,
  option, 
  onClose,
  onShare,
  referralCode,
}) {
  const handleShare = () => {
    telegram.hapticImpact('light');
    if (onShare) {
      onShare();
    } else {
      const text = isWin
        ? `🎉 I just won ${formatSatz(amount)} SATZ on MintIQ!\n\nPrediction: "${questTitle}"\n\nJoin and earn real Bitcoin! 🚀`
        : `😤 Just lost a prediction on MintIQ. Time for revenge!\n\nJoin me and let's stack SATZ together! 💪`;
      
      telegram.shareUrl(`https://t.me/MintIQBot`, text);
    }
    onClose();
  };

  return (
    <div className="p-6 pt-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 200 }}
        className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isWin ? 'bg-success/20' : 'bg-danger/20'
        }`}
      >
        {isWin ? (
          <Trophy size={40} className="text-success" />
        ) : (
          <TrendingDown size={40} className="text-danger" />
        )}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`text-2xl font-bold mb-2 ${isWin ? 'text-success' : 'text-danger'}`}
      >
        {isWin ? 'You Won! 🎉' : 'Better Luck Next Time'}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <p className={`text-3xl font-bold ${isWin ? 'text-gradient-gold' : 'text-dark-400'}`}>
          {isWin ? '+' : '-'}{formatSatz(amount)} SATZ
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-800 rounded-xl p-4 mb-6"
      >
        <p className="text-dark-400 text-sm mb-1">Prediction</p>
        <p className="text-white font-medium line-clamp-2">{questTitle}</p>
        <p className="text-dark-400 text-sm mt-2">Your answer: {option}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3"
      >
        <button onClick={onClose} className="btn-secondary flex-1">
          Close
        </button>
        {isWin ? (
          <ShareWinButton 
            amount={amount}
            questTitle={questTitle}
            questId={questId}
            referralCode={referralCode}
            className="flex-1"
          />
        ) : (
          <button onClick={handleShare} className="btn-primary flex-1">
            <Share2 size={18} />
            Share
          </button>
        )}
      </motion.div>
    </div>
  );
}
