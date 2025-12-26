import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Star, 
  Sparkles,
  Frame,
  Award,
  Loader2,
  Check
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';

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

const SHOP_ITEMS = [
  { id: 1, category: 'frames', key: 'frame_gold', name: 'Gold Frame', price: 5000, rarity: 'rare', icon: '🪙', description: 'A shiny gold frame for your profile' },
  { id: 2, category: 'frames', key: 'frame_diamond', name: 'Diamond Frame', price: 15000, rarity: 'epic', icon: '💎', description: 'Dazzling diamond frame' },
  { id: 3, category: 'frames', key: 'frame_fire', name: 'Fire Frame', price: 10000, rarity: 'rare', icon: '🔥', description: 'For hot predictors' },
  { id: 4, category: 'badges', key: 'badge_early_adopter', name: 'Early Adopter', price: 2500, rarity: 'common', icon: '⭐', description: 'Show you were here from the start' },
  { id: 5, category: 'badges', key: 'badge_whale', name: 'Whale Badge', price: 25000, rarity: 'legendary', icon: '🐋', description: 'For the big players' },
  { id: 6, category: 'badges', key: 'badge_lucky', name: 'Lucky Charm', price: 7500, rarity: 'rare', icon: '🍀', description: '+1% mystery box chance', effect: '+1% mystery box' },
  { id: 7, category: 'effects', key: 'effect_confetti', name: 'Confetti Burst', price: 3000, rarity: 'common', icon: '🎊', description: 'Celebrate wins with confetti' },
  { id: 8, category: 'effects', key: 'effect_lightning', name: 'Lightning Strike', price: 8000, rarity: 'rare', icon: '⚡', description: 'Epic win animation' },
];

export default function ShopPage() {
  const { user, refreshUser } = useUserStore();
  const { showToast, openModal } = useUIStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [ownedItems, setOwnedItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(null);

  const balance = user?.satz_balance || 0;

  // Fetch owned items on mount
  useEffect(() => {
    fetchOwnedItems();
  }, []);

  const fetchOwnedItems = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/miniapp/shop/items');
      if (response.success && response.items) {
        const owned = new Set(response.items.filter(i => i.owned).map(i => i.id));
        setOwnedItems(owned);
      }
    } catch (error) {
      console.error('Failed to fetch shop items:', error);
      // Silently fail - items will show as not owned
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = SHOP_ITEMS.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  const handlePurchase = (item) => {
    if (ownedItems.has(item.id)) {
      showToast('You already own this item!', 'info');
      return;
    }

    if (balance < item.price) {
      showToast('Insufficient SATZ balance', 'error');
      return;
    }

    openModal('confirm', {
      title: `Purchase ${item.name}?`,
      message: `This will cost ${formatSatz(item.price)} SATZ. SATZ spent on cosmetics is permanently burned.`,
      confirmText: 'Buy Now',
      confirmVariant: 'gold',
      icon: (
        <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center text-3xl">
          {item.icon}
        </div>
      ),
      onConfirm: async () => {
        setIsPurchasing(item.id);
        telegram.hapticImpact('medium');
        
        try {
          const response = await api.post('/api/miniapp/shop/purchase', {
            itemId: item.id
          });
          
          if (response.success) {
            telegram.hapticNotification('success');
            
            // Update owned items
            setOwnedItems(prev => new Set([...prev, item.id]));
            
            showToast(`${item.name} purchased! 🎉`, 'success');
            
            // Refresh user to update balance
            if (refreshUser) {
              refreshUser();
            }
          }
        } catch (error) {
          telegram.hapticNotification('error');
          showToast(error.message || 'Failed to complete purchase', 'error');
        } finally {
          setIsPurchasing(null);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    );
  }

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
          {filteredItems.map((item, index) => {
            const isOwned = ownedItems.has(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card p-4 relative ${isOwned ? 'border-mint-500/30' : ''}`}
              >
                {/* Owned badge */}
                {isOwned && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-mint-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{item.icon}</div>
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
                    {isOwned ? 'Owned' : formatSatz(item.price)}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePurchase(item)}
                    disabled={balance < item.price || isOwned || isPurchasing === item.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      isOwned
                        ? 'bg-mint-500/20 text-mint-400'
                        : balance >= item.price && isPurchasing !== item.id
                        ? 'bg-gold-gradient text-dark-900'
                        : 'bg-dark-700 text-dark-400'
                    }`}
                  >
                    {isPurchasing === item.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : isOwned ? (
                      'Owned'
                    ) : (
                      'Buy'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
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
