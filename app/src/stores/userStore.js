import { create } from 'zustand';
import api from '../services/api';
import telegram from '../services/telegram';

const MOCK_USER = {
  id: 1, telegram_id: 123456789, username: 'testuser', first_name: 'Test',
  satz_balance: 25000, total_earned: 150000, total_spent: 50000, total_won: 75000,
  predictions_made: 156, predictions_won: 98, win_rate: 62.82, current_streak: 5,
  best_streak: 12, tier: 'skilled', tier_points: 2500, referral_count: 8
};

function normalize(user) {
  if (!user) return null;
  return {
    ...user,
    tier: user.status_tier || user.tier || 'newcomer',
    satz_balance: Number(user.satz_balance) || 0,
    total_earned: Number(user.total_earned) || 0,
    total_spent: Number(user.total_spent) || 0,
    total_won: Number(user.total_won) || 0,
    predictions_made: Number(user.predictions_made) || 0,
    predictions_won: Number(user.predictions_won) || 0,
    win_rate: Number(user.win_rate) || 0,
    current_streak: Number(user.current_streak) || 0,
    best_streak: Number(user.best_streak) || 0,
    tier_points: Number(user.tier_points) || 0,
    referral_count: Number(user.referral_count) || 0
  };
}

export const useUserStore = create((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  isAuthenticated: false,
  error: null,
  lastFetch: null,

  get balance() { return get().user?.satz_balance || 0; },

  // Initialize and authenticate
  initialize: async () => {
    console.log('[MintIQ] Starting initialization...');
    set({ isLoading: true, error: null });
    
    try {
      // In dev mode without Telegram, use mock data
      if (import.meta.env.DEV && !telegram.isAvailable) {
        console.log('[MintIQ] Dev mode: Using mock data (no Telegram)');
        set({ 
          user: normalize(MOCK_USER), 
          isLoading: false, 
          isInitialized: true, 
          isAuthenticated: true,
          lastFetch: Date.now() 
        });
        return MOCK_USER;
      }

      // Get Telegram initData
      const initData = telegram.initData;
      
      if (!initData) {
        console.warn('[MintIQ] No Telegram initData available');
        if (import.meta.env.DEV) {
          console.log('[MintIQ] Dev mode: Falling back to mock data');
          set({ 
            user: normalize(MOCK_USER), 
            isLoading: false, 
            isInitialized: true, 
            isAuthenticated: true,
            lastFetch: Date.now() 
          });
          return MOCK_USER;
        }
        set({ isLoading: false, isInitialized: true, isAuthenticated: false, error: 'No Telegram data' });
        return null;
      }

      // Authenticate with backend
      console.log('[MintIQ] Authenticating with backend...');
      const authResponse = await api.authenticate(initData);
      
      if (!authResponse.token) {
        throw new Error('No token received from server');
      }

      console.log('[MintIQ] Authentication successful');
      const userData = normalize(authResponse.user);
      
      set({ 
        user: userData, 
        isLoading: false, 
        isInitialized: true, 
        isAuthenticated: true,
        lastFetch: Date.now() 
      });
      
      return userData;
      
    } catch (error) {
      console.error('[MintIQ] Initialization error:', error.message);
      
      // In dev mode, fallback to mock data
      if (import.meta.env.DEV) {
        console.log('[MintIQ] Dev mode: Falling back to mock data after error');
        set({ 
          user: normalize(MOCK_USER), 
          isLoading: false, 
          isInitialized: true, 
          isAuthenticated: true,
          lastFetch: Date.now() 
        });
        return MOCK_USER;
      }
      
      set({ error: error.message, isLoading: false, isInitialized: true, isAuthenticated: false });
      return null;
    }
  },

  fetchUser: async (force = false) => {
    const state = get();
    
    // If not authenticated, initialize first
    if (!state.isAuthenticated && !state.isInitialized) {
      return await get().initialize();
    }
    
    // Skip if recently fetched
    if (!force && state.lastFetch && Date.now() - state.lastFetch < 30000) {
      return state.user;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // In dev mode without Telegram, use mock data
      if (import.meta.env.DEV && !telegram.isAvailable) {
        console.log('[MintIQ] Dev mode: Using mock user data');
        set({ user: normalize(MOCK_USER), isLoading: false, isInitialized: true, lastFetch: Date.now() });
        return MOCK_USER;
      }
      
      console.log('[MintIQ] Fetching user profile...');
      const response = await api.getProfile();
      const userData = normalize(response.user || response);
      console.log('[MintIQ] User loaded:', userData?.username || userData?.first_name || 'anonymous');
      set({ user: userData, isLoading: false, isInitialized: true, lastFetch: Date.now() });
      return userData;
    } catch (error) {
      console.error('[MintIQ] Fetch user error:', error.message);
      
      // In dev mode, fallback to mock data on error
      if (import.meta.env.DEV) {
        console.log('[MintIQ] Dev mode: Falling back to mock user data');
        set({ user: normalize(MOCK_USER), isLoading: false, isInitialized: true, lastFetch: Date.now() });
        return MOCK_USER;
      }
      
      set({ error: error.message, isLoading: false, isInitialized: true });
      return null;
    }
  },

  updateBalance: (newBalance) => { const user = get().user; if (user) set({ user: { ...user, satz_balance: Number(newBalance) || 0 } }); },
  addBalance: (amount) => { const user = get().user; if (user) set({ user: { ...user, satz_balance: (Number(user.satz_balance) || 0) + (Number(amount) || 0), total_earned: (Number(user.total_earned) || 0) + (Number(amount) || 0) } }); },
  deductBalance: (amount) => { const user = get().user; if (user) set({ user: { ...user, satz_balance: Math.max(0, (Number(user.satz_balance) || 0) - (Number(amount) || 0)), total_spent: (Number(user.total_spent) || 0) + (Number(amount) || 0) } }); },
  updateStreak: (newStreak) => { const user = get().user; if (user) set({ user: { ...user, current_streak: Number(newStreak) || 0, best_streak: Math.max(Number(user.best_streak) || 0, Number(newStreak) || 0) } }); },
  updateUser: (updates) => { const user = get().user; if (user) set({ user: normalize({ ...user, ...updates }) }); },
  logout: async () => { try { await api.post('/api/miniapp/logout'); } catch (e) {} set({ user: null, isInitialized: false, isAuthenticated: false, lastFetch: null }); },
  clearUser: () => set({ user: null, lastFetch: null }),
  clearError: () => set({ error: null }),
  refreshUser: async () => get().fetchUser(true)
}));

export default useUserStore;
