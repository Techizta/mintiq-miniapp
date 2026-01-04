/**
 * MintIQ Earn Store
 */

import { create } from 'zustand';
import api from '../services/api';

export const useEarnStore = create((set, get) => ({
  dailyReward: null,
  isLoading: false,

  fetchDailyReward: async () => {
    set({ isLoading: true });
    try {
      // FIXED: Correct endpoint path to match backend /earn/daily
      const data = await api.get('/api/miniapp/earn/daily');
      console.log('[EarnStore] Daily reward data:', data);
      set({ 
        dailyReward: data || {
          canClaim: false,
          streakReward: 100,
          currentStreak: 0,
          nextClaimIn: null
        }, 
        isLoading: false 
      });
      return data;
    } catch (error) {
      console.error('Daily reward fetch error:', error);
      // FIXED: Default to canClaim: false on error to prevent false positives
      set({ 
        dailyReward: {
          canClaim: false,
          streakReward: 100,
          currentStreak: 0,
          nextClaimIn: null
        },
        isLoading: false 
      });
      return null;
    }
  },

  claimDailyReward: async () => {
    try {
      // FIXED: Correct endpoint path to match backend /earn/daily/claim
      const result = await api.post('/api/miniapp/earn/daily/claim');
      
      // Update local state
      set(state => ({
        dailyReward: {
          ...state.dailyReward,
          canClaim: false,
          currentStreak: (state.dailyReward?.currentStreak || 0) + 1,
          nextClaimIn: '24h'
        }
      }));
      
      return result;
    } catch (error) {
      console.error('Claim error:', error);
      throw error;
    }
  },

  reset: () => {
    set({ dailyReward: null, isLoading: false });
  }
}));

export default useEarnStore;
