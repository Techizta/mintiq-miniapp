import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  TrendingUp,
  Star,
  Check,
  Loader2
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
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
  const { user, refreshUser } = useUserStore();
  const { showToast, openModal } = useUIStore();
  const [activeBooster, setActiveBooster] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  const balance = user?.satz_balance || 0;

  // Fetch active booster on mount
  useEffect(() => {
    fetchActiveBooster();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!activeBooster) return;

    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(activeBooster.expiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        setActiveBooster(null);
        setTimeRemaining('');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(`${days}d ${hours % 24}h left`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m left`);
      } else {
        setTimeRemaining(`${minutes}m left`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeBooster]);

  const fetchActiveBooster = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/miniapp/boosters/active');
      if (response.active && response.booster) {
        setActiveBooster(response.booster);
      } else {
        setActiveBooster(null);
      }
    } catch (error) {
      console.error('Failed to fetch active booster:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = (booster) => {
    if (balance < booster.price) {
      showToast('Insufficient SATZ balance', 'error');
      return;
    }

    if (activeBooster) {
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
        setIsActivating(true);
        telegram.hapticImpact('medium');
        
        try {
          const response = await api.post('/api/miniapp/boosters/activate', {
            boosterId: booster.id
          });
          
          if (response.success) {
            telegram.hapticNotification('success');
            setActiveBooster(response.booster);
            showToast(`${booster.name} activated! 🚀`, 'success');
            // Refresh user to get updated balance
            refreshUser();
          }
        } catch (error) {
          telegram.hapticNotification('error');
          showToast(error.message || 'Failed to activate booster', 'error');
        } finally {
          setIsActivating(false);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-mint-400" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Active booster banner */}
      {activeBooster && (
        <div className="px-4 pt-4 mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card bg-gradient-to-r from-gold-600/30 to-gold-800/30 border-gold-500/30 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">
                {BOOSTERS.find(b => b.id === activeBooster.id)?.icon || '⚡'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{activeBooster.name}</h3>
                  <span className="badge-success">Active</span>
                </div>
                <p className="text-sm text-dark-400">
                  {activeBooster.multiplier}x earnings • {timeRemaining || activeBooster.duration}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gold-400">{activeBooster.multiplier}x</p>
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
                  disabled={balance < booster.price || activeBooster || isActivating}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                    balance >= booster.price && !activeBooster && !isActivating
                      ? 'bg-white text-dark-900'
                      : 'bg-white/20 text-white/50'
                  }`}
                >
                  {isActivating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : activeBooster ? (
                    'Active'
                  ) : (
                    'Activate'
                  )}
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
