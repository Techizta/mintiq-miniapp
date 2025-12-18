import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import telegram from '../../services/telegram';
import { formatSatz } from '../../utils/helpers';

export default function Celebration({ type, data }) {
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
  }, [type]);

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#0066FF', '#22C55E', '#8B5CF6'],
    });
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

  const renderContent = () => {
    switch (type) {
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
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="text-center p-8"
      >
        {renderContent()}
      </motion.div>
    </motion.div>
  );
}
