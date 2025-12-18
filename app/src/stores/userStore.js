import { create } from 'zustand';
import api from '../services/api';
import telegram from '../services/telegram';

const MOCK_USER = { id: 1, telegram_id: 123456789, username: 'testuser', first_name: 'Test', satz_balance: 25000, total_earned: 150000, total_spent: 50000, total_won: 75000, predictions_made: 156, predictions_won: 98, win_rate: 62.82, current_streak: 5, best_streak: 12, tier: 'skilled', tier_points: 2500, referral_count: 8 };

function normalize(user) {
  if (!user) return null;
  return { ...user, tier: user.status_tier || user.tier || 'novice', satz_balance: Number(user.satz_balance) || 0, total_earned: Number(user.total_earned) || 0, total_spent: Number(user.total_spent) || 0, total_won: Number(user.total_won) || 0, predictions_made: Number(user.predictions_made) || 0, predictions_won: Number(user.predictions_won) || 0, win_rate: Number(user.win_rate) || 0, current_streak: Number(user.current_streak) || 0, best_streak: Number(user.best_streak) || 0, tier_points: Number(user.tier_points) || 0, referral_count: Number(user.referral_count) || 0 };
}

export const useUserStore = create((set, get) => ({
  user: null, isLoading: false, error: null, lastFetch: null,
  get balance() { return get().user?.satz_balance || 0; },
  fetchUser: async (force = false) => {
    const lastFetch = get().lastFetch;
    if (!force && lastFetch && Date.now() - lastFetch < 30000) return get().user;
    set({ isLoading: true, error: null });
    try {
      if (import.meta.env.DEV && !telegram.isAvailable) {
        set({ user: normalize(MOCK_USER), isLoading: false, lastFetch: Date.now() });
        return MOCK_USER;
      }
      const response = await api.getProfile();
      const userData = normalize(response.user || response);
      set({ user: userData, isLoading: false, lastFetch: Date.now() });
      return userData;
    } catch (error) {
      console.error('Fetch user error:', error);
      if (import.meta.env.DEV) { set({ user: normalize(MOCK_USER), isLoading: false, lastFetch: Date.now() }); return MOCK_USER; }
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  updateBalance: (newBalance) => { const user = get().user; if (user) set({ user: { ...user, satz_balance: Number(newBalance) || 0 } }); },
  addBalance: (amount) => { const user = get().user; if (user) set({ user: { ...user, satz_balance: (Number(user.satz_balance) || 0) + (Number(amount) || 0), total_earned: (Number(user.total_earned) || 0) + (Number(amount) || 0) } }); },
  deductBalance: (amount) => { const user = get().user; if (user) set({ user: { ...user, satz_balance: Math.max(0, (Number(user.satz_balance) || 0) - (Number(amount) || 0)), total_spent: (Number(user.total_spent) || 0) + (Number(amount) || 0) } }); },
  updateStreak: (newStreak) => { const user = get().user; if (user) set({ user: { ...user, current_streak: Number(newStreak) || 0, best_streak: Math.max(Number(user.best_streak) || 0, Number(newStreak) || 0) } }); },
  updateUser: (updates) => { const user = get().user; if (user) set({ user: normalize({ ...user, ...updates }) }); },
  clearUser: () => set({ user: null, lastFetch: null }),
  clearError: () => set({ error: null }),
  refreshUser: async () => { return get().fetchUser(true); },
}));
