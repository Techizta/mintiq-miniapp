import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Star, 
  Sparkles,
  Frame,
  Award,
  Palette
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';

const SHOP_ITEMS = [
  {
    id: 1,
    category: 'frames',
    name: 'Gold Frame',
    description: 'A shiny gold frame for your profile',
    price: 5000,
    preview: '🪙',
    rarity: 'rare',
  },
  {
    id: 2,
    category: 'frames',
    name: 'Diamond Frame',
    description: 'Dazzling diamond frame',
    price: 15000,
    preview: '💎',
    rarity: 'epic',
  },
  {
    id: 3,
    category: 'frames',
    name: 'Fire Frame',
    description: 'For hot predictors',
    price: 10000,
    preview: '🔥',
    rarity: 'rare',
  },
  {
    id: 4,
    category: 'badges',
    name: 'Early Adopter',
    description: 'Show you were here from the start',
    price: 2500,
    preview: '⭐',
    rarity: 'common',
  },
  {
    id: 5,
    category: 'badges',
    name: 'Whale Badge',
    description: 'For the big players',
    price: 25000,
    preview: '🐋',
    rarity: 'legendary',
  },
  {
    id: 6,
    category: 'badges',
    name: 'Lucky Charm',
    description: '+1% mystery box chance',
    price: 7500,
    preview: '🍀',
    rarity: 'rare',
    effect: '+1% mystery box',
  },
  {
    id: 7,
    category: 'effects',
    name: 'Confetti Burst',
    description: 'Celebrate wins with confetti',
    price: 3000,
    preview: '🎊',
    rarity: 'common',
  },
  {
    id: 8,
    category: 'effects',
    name: 'Lightning Strike',
    description: 'Epic win animation',
    price: 8000,
    preview: '⚡',
    rarity: 'rare',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: ShoppingBag },
  { id: 'frames', label: 'Frames', icon: Frame },
  { id: 'badges', label: 'Badges', icon: Award },
  { id: 'effects', label: 'Effects', icon: Sparkles },
];

const RARITY_COLORS = {
  common: 'text-gray-400 bg-gray-500/20',
  rare: 'text-blue-400 bg-blue-500/20',
  epic: 'text-purple-400 bg-purple-500/20',
  legendary: 'text-gold-400 bg-gold-500/20',
};

export default function ShopPage() {
  const { user, deductBalance } = useUserStore();
  const { showToast, openModal } = useUIStore();
  const [activeCategory, setActiveCategory] = useState('all');

  const balance = user?.satz_balance || 0;

  const filteredItems = SHOP_ITEMS.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  const handlePurchase = (item) => {
    if (balance < item.price) {
      showToast('Insufficient SATZ balance', 'error');
      return;
    }

    openModal('confirm', {
      title: `Purchase ${item.name}?`,
      message: `This will cost ${formatSatz(item.price)} SATZ.`,
      confirmText: 'Buy Now',
      confirmVariant: 'gold',
      icon: (
        <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center text-3xl">
          {item.preview}
        </div>
      ),
      onConfirm: async () => {
        telegram.hapticNotification('success');
        deductBalance(item.price);
        showToast(`${item.name} purchased! 🎉`, 'success');
      },
    });
  };

  return (
    <div className="pb-4">
      {/* Balance header */}
      <div className="px-4 pt-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-r from-gold-600/20 to-gold-800/20 border-gold-500/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Your Balance</p>
              <p className="text-2xl font-bold text-gradient-gold">
                {formatSatz(balance)} SATZ
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center">
              <ShoppingBag size={24} className="text-gold-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  telegram.hapticSelection();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gold-500 text-dark-900'
                    : 'bg-dark-800 text-dark-400'
                }`}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4"
            >
              {/* Preview */}
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{item.preview}</div>
                <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${RARITY_COLORS[item.rarity]}`}>
                  {item.rarity}
                </span>
              </div>

              {/* Info */}
              <h3 className="font-semibold text-white text-sm mb-1">{item.name}</h3>
              <p className="text-xs text-dark-400 mb-2 line-clamp-2">{item.description}</p>
              
              {item.effect && (
                <p className="text-xs text-mint-400 mb-2">✨ {item.effect}</p>
              )}

              {/* Price & Buy */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gold-400">
                  {formatSatz(item.price)}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePurchase(item)}
                  disabled={balance < item.price}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    balance >= item.price
                      ? 'bg-gold-gradient text-dark-900'
                      : 'bg-dark-700 text-dark-400'
                  }`}
                >
                  Buy
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 mt-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} className="text-gold-400" />
            <span className="text-sm font-medium text-white">About Shop Items</span>
          </div>
          <p className="text-xs text-dark-400">
            Shop items are cosmetic customizations for your profile. 
            Purchased SATZ is permanently burned, helping maintain token value. 
            Some items have special effects!
          </p>
        </div>
      </div>
    </div>
  );
}
