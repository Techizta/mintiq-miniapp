/**
 * MintIQ Celebration Component - ENHANCED
 * 
 * Key Improvements:
 * - Better messaging for predictions
 * - Share to friends option
 * - Better visual feedback
 * - Auto-dismiss with countdown
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Share2, X, Copy, Users, Check } from 'lucide-react';
import telegram from '../../services/telegram';
import { formatSatz, copyToClipboard } from '../../utils/helpers';

export default function Celebration({ type, data, onClose }) {
  const [countdown, setCountdown] = useState(5);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Trigger haptic feedback
    telegram.hapticNotification('success');

    // Trigger confetti based on type
    switch (type) {
      case 'win':
      case 'daily':
      case 'streak':
        fireConfetti();
        break;
      case 'bet':
      case 'prediction':
        firePredictionConfetti();
        break;
      case 'tier_up':
        fireTierUpConfetti();
        break;
      case 'mystery_box':
        fireMysteryBoxConfetti();
        break;
      case 'spin':
        fireSpinConfetti();
        break;
      default:
        fireConfetti();
    }

    // Auto-dismiss countdown
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onClose) onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [type, onClose]);

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#0066FF', '#22C55E', '#8B5CF6'],
    });
  };

  const firePredictionConfetti = () => {
    // Celebratory burst for prediction placed
    const duration = 1500;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#10B981', '#22D3EE', '#FFD700'],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#10B981', '#22D3EE', '#FFD700'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const fireTierUpConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FF6B00'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FF6B00'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const fireMysteryBoxConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.5 },
      colors: ['#FFD700', '#8B5CF6', '#EC4899', '#22C55E'],
      shapes: ['star', 'circle'],
    });
  };

  const fireSpinConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#0066FF'],
    });
  };

  // Share handlers
  const handleShare = () => {
    telegram.hapticSelection();
    const questId = data?.questId || data?.id;
    const message = type === 'bet' || type === 'prediction'
      ? `🎯 I just made a prediction on MintIQ!\n\n${data?.option ? `My pick: ${data.option}` : ''}\n\nJoin me and predict to win SATZ! 🚀`
      : `🎉 I'm winning on MintIQ! ${data?.amount ? `+${formatSatz(data.amount)} SATZ` : ''}\n\nJoin me and start earning! 🚀`;
    
    telegram.shareUrl(
      questId ? `https://t.me/MintIQBot?start=quest_${questId}` : 'https://t.me/MintIQBot',
      message
    );
  };

  const handleCopyLink = async () => {
    telegram.hapticSelection();
    const questId = data?.questId || data?.id;
    const link = questId 
      ? `https://t.me/MintIQBot?start=quest_${questId}`
      : 'https://t.me/MintIQBot';
    await copyToClipboard(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = () => {
    telegram.hapticSelection();
    if (onClose) onClose();
  };

  const renderContent = () => {
    switch (type) {
      case 'bet':
      case 'prediction':
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, delay: 0.1 }}
              className="text-6xl mb-4"
            >
              🎯
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Prediction Placed!</h2>
            {data?.option && (
              <p className="text-lg text-mint-400 font-medium mb-1">
                Your pick: {data.option}
              </p>
            )}
            {data?.amount && (
              <p className="text-dark-400 mb-2">
                Bet: {formatSatz(data.amount)} SATZ
              </p>
            )}
            {data?.potentialWin && (
              <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl px-4 py-3 mb-4">
                <p className="text-sm text-gold-400">Potential Win</p>
                <p className="text-2xl font-bold text-gold-400">
                  {formatSatz(data.potentialWin)} SATZ
                </p>
              </div>
            )}
            {data?.isFirstPrediction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-mint-500/10 border border-mint-500/30 rounded-xl px-4 py-2 mb-4"
              >
                <p className="text-mint-400 text-sm font-medium">
                  🎁 +100 SATZ First Prediction Bonus!
                </p>
              </motion.div>
            )}
            <p className="text-dark-400 text-sm max-w-xs mx-auto">
              Share with friends to increase the pool and improve your odds!
            </p>
          </>
        );

      case 'win':
        return (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">You Won!</h2>
            {data?.amount && (
              <p className="text-3xl font-bold text-gradient-gold">
                +{formatSatz(data.amount)} SATZ
              </p>
            )}
          </>
        );

      case 'daily':
        return (
          <>
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-2xl font-bold text-white mb-2">Daily Reward!</h2>
            {data?.amount && (
              <p className="text-3xl font-bold text-gradient-gold">
                +{formatSatz(data.amount)} SATZ
              </p>
            )}
            {data?.streak && (
              <p className="text-dark-400 mt-2">
                🔥 {data.streak} day streak!
              </p>
            )}
          </>
        );

      case 'streak':
        return (
          <>
            <div className="text-6xl mb-4">🔥</div>
            <h2 className="text-2xl font-bold text-white mb-2">Streak Bonus!</h2>
            <p className="text-3xl font-bold text-gradient">
              {data?.streak} Days
            </p>
            {data?.amount && (
              <p className="text-xl text-gold-400 mt-2">
                +{formatSatz(data.amount)} SATZ
              </p>
            )}
          </>
        );

      case 'tier_up':
        return (
          <>
            <div className="text-6xl mb-4">⬆️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Tier Up!</h2>
            <p className="text-3xl font-bold" style={{ color: data?.tierColor }}>
              {data?.tierName}
            </p>
            <p className="text-dark-400 mt-2">
              {data?.multiplier}x rewards multiplier
            </p>
          </>
        );

      case 'mystery_box':
        return (
          <>
            <div className="text-6xl mb-4">📦✨</div>
            <h2 className="text-2xl font-bold text-white mb-2">Mystery Box!</h2>
            {data?.amount && (
              <p className="text-3xl font-bold text-gradient-gold">
                +{formatSatz(data.amount)} SATZ
              </p>
            )}
          </>
        );

      case 'spin':
        return (
          <>
            <div className="text-6xl mb-4">🎰</div>
            <h2 className="text-2xl font-bold text-white mb-2">Spin Win!</h2>
            {data?.amount && (
              <p className="text-3xl font-bold text-gradient-gold">
                +{formatSatz(data.amount)} SATZ
              </p>
            )}
          </>
        );

      default:
        return (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
          </>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleDismiss}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="text-center p-6 max-w-sm mx-4"
      >
        {renderContent()}

        {/* Share Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 space-y-3"
        >
          {/* Share Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="w-full py-3 bg-gradient-to-r from-mint-500 to-cyan-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            Share with Friends
          </motion.button>

          {/* Copy Link Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyLink}
            className="w-full py-3 bg-dark-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 border border-white/10"
          >
            {copied ? <Check size={18} className="text-mint-400" /> : <Copy size={18} />}
            {copied ? 'Link Copied!' : 'Copy Link'}
          </motion.button>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="text-dark-400 text-sm hover:text-white transition-colors"
          >
            Continue ({countdown}s)
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
