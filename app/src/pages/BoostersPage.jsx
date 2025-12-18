import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  TrendingUp,
  Star,
  Check
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';

const BOOSTERS = [
  {
    id: 'booster_2x_1d',
    name: '2x Booster',
    description: 'Double your earnings from predictions',
    multiplier: 2,
    duration: '24 hours',
    durationHours: 24,
    price: 2500,
    icon: '⚡',
    color: 'mint',
  },
  {
    id: 'booster_3x_1d',
    name: '3x Booster',
    description: 'Triple your earnings from predictions',
    multiplier: 3,
    duration: '24 hours',
    durationHours: 24,
    price: 5000,
    icon: '🚀',
    color: 'gold',
    popular: true,
  },
  {
    id: 'booster_5x_12h',
    name: '5x Mega Booster',
    description: '5x earnings for intense sessions',
    multiplier: 5,
    duration: '12 hours',
    durationHours: 12,
    price: 7500,
    icon: '💎',
    color: 'purple',
  },
  {
    id: 'booster_2x_7d',
    name: '2x Weekly',
    description: 'Double earnings for a full week',
    multiplier: 2,
    duration: '7 days',
    durationHours: 168,
    price: 15000,
    icon: '🌟',
    color: 'blue',
  },
];

const COLOR_CLASSES = {
  mint: 'from-mint-600 to-mint-800 border-mint-500/30',
  gold: 'from-gold-600 to-gold-800 border-gold-500/30',
  purple: 'from-purple-600 to-purple-800 border-purple-500/30',
  blue: 'from-blue-600 to-blue-800 border-blue-500/30',
};

export default function BoostersPage() {
  const { user, deductBalance } = useUserStore();
  const { showToast, openModal } = useUIStore();
  const [activeBooster, setActiveBooster] = useState(null);

  const balance = user?.satz_balance || 0;

  // Mock active booster for demo
  const currentBooster = activeBooster || null;

  const handleActivate = (booster) => {
    if (balance < booster.price) {
      showToast('Insufficient SATZ balance', 'error');
      return;
    }

    if (currentBooster) {
      showToast('You already have an active booster', 'warning');
      return;
    }

    openModal('confirm', {
      title: `Activate ${booster.name}?`,
      message: `${booster.multiplier}x earnings for ${booster.duration}. Cost: ${formatSatz(booster.price)} SATZ`,
      confirmText: 'Activate',
      confirmVariant: 'gold',
      icon: (
        <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center text-3xl">
          {booster.icon}
        </div>
      ),
      onConfirm: async () => {
        telegram.hapticNotification('success');
        deductBalance(booster.price);
        setActiveBooster({
          ...booster,
          activatedAt: Date.now(),
          expiresAt: Date.now() + booster.durationHours * 60 * 60 * 1000,
        });
        showToast(`${booster.name} activated! 🚀`, 'success');
      },
    });
  };

  return (
    <div className="pb-4">
      {/* Active booster banner */}
      {currentBooster && (
        <div className="px-4 pt-4 mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card bg-gradient-to-r from-gold-600/30 to-gold-800/30 border-gold-500/30 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">{currentBooster.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{currentBooster.name}</h3>
                  <span className="badge-success">Active</span>
                </div>
                <p className="text-sm text-dark-400">
                  {currentBooster.multiplier}x earnings • Expires in {currentBooster.duration}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gold-400">{currentBooster.multiplier}x</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Balance */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Boosters</h2>
          <div className="text-right">
            <p className="text-2xs text-dark-400">Balance</p>
            <p className="font-bold text-gradient-gold">{formatSatz(balance)} SATZ</p>
          </div>
        </div>
      </div>

      {/* Booster cards */}
      <div className="px-4 space-y-3">
        {BOOSTERS.map((booster, index) => (
          <motion.div
            key={booster.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`card bg-gradient-to-r ${COLOR_CLASSES[booster.color]} p-4 relative overflow-hidden`}
          >
            {booster.popular && (
              <div className="absolute top-0 right-0 bg-gold-500 text-dark-900 text-2xs font-bold px-2 py-0.5 rounded-bl-lg">
                POPULAR
              </div>
            )}

            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="text-4xl">{booster.icon}</div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-white">{booster.name}</h3>
                <p className="text-sm text-white/70 mb-1">{booster.description}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-white/60">
                    <TrendingUp size={12} />
                    {booster.multiplier}x earnings
                  </span>
                  <span className="flex items-center gap-1 text-white/60">
                    <Clock size={12} />
                    {booster.duration}
                  </span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="text-right">
                <p className="text-lg font-bold text-white mb-1">
                  {formatSatz(booster.price)}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleActivate(booster)}
                  disabled={balance < booster.price || currentBooster}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                    balance >= booster.price && !currentBooster
                      ? 'bg-white text-dark-900'
                      : 'bg-white/20 text-white/50'
                  }`}
                >
                  {currentBooster ? 'Active' : 'Activate'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-bold text-white mb-3">How Boosters Work</h3>
        
        <div className="space-y-3">
          <div className="card p-4 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-mint-500/20 flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-mint-400" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">Multiplied Winnings</p>
              <p className="text-xs text-dark-400">
                Your prediction payouts are multiplied by the booster value
              </p>
            </div>
          </div>

          <div className="card p-4 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-gold-400" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">Time Limited</p>
              <p className="text-xs text-dark-400">
                Boosters activate immediately and expire after the duration
              </p>
            </div>
          </div>

          <div className="card p-4 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Star size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">Stack with Tier</p>
              <p className="text-xs text-dark-400">
                Boosters multiply your tier bonus too!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
