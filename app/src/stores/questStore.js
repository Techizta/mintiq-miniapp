import { create } from 'zustand';
import api from '../services/api';

// Mock quests for development
const MOCK_QUESTS = [
  {
    id: 1,
    title: 'Will Bitcoin be above $105,000 by December 20?',
    description: 'Price at 00:00 UTC will be used for resolution.',
    category: 'crypto',
    option_a: 'Yes, above $105K',
    option_b: 'No, below $105K',
    pool_a: 125000,
    pool_b: 98000,
    total_pool: 223000,
    participant_count: 47,
    betting_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolution_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    metadata: { type: 'crypto_price', coinId: 'bitcoin', targetPrice: 105000 },
  },
  {
    id: 2,
    title: 'Will ETH gain more than 5% in the next 24 hours?',
    description: 'Based on CoinGecko price data.',
    category: 'crypto',
    option_a: 'Yes',
    option_b: 'No',
    pool_a: 45000,
    pool_b: 62000,
    total_pool: 107000,
    participant_count: 31,
    betting_deadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    resolution_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    metadata: { type: 'crypto_change', coinId: 'ethereum', targetPercent: 5 },
  },
  {
    id: 3,
    title: 'Will Solana close GREEN today?',
    description: 'Daily candle close at 00:00 UTC.',
    category: 'crypto',
    option_a: 'Yes, Green',
    option_b: 'No, Red',
    pool_a: 88000,
    pool_b: 75000,
    total_pool: 163000,
    participant_count: 52,
    betting_deadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    resolution_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    metadata: { type: 'crypto_direction', coinId: 'solana' },
  },
];

export const useQuestStore = create((set, get) => ({
  // State
  quests: [],
  currentQuest: null,
  myPredictions: [],
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    status: 'active',
    sort: 'deadline',
  },

  // Actions
  fetchQuests: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      const filters = get().filters;
      const queryParams = {
        ...filters,
        ...params,
      };

      // Development mode - use mock data
      if (import.meta.env.DEV) {
        await new Promise(r => setTimeout(r, 500)); // Simulate API delay
        set({
          quests: MOCK_QUESTS,
          isLoading: false,
        });
        return MOCK_QUESTS;
      }

      const response = await api.getQuests(queryParams);
      
      set({
        quests: response.quests || response,
        isLoading: false,
      });

      return response.quests || response;
    } catch (error) {
      console.error('Fetch quests error:', error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchQuestById: async (questId) => {
    set({ isLoading: true, error: null });

    try {
      // Development mode
      if (import.meta.env.DEV) {
        await new Promise(r => setTimeout(r, 300));
        const quest = MOCK_QUESTS.find(q => q.id === parseInt(questId));
        set({
          currentQuest: quest || null,
          isLoading: false,
        });
        return quest;
      }

      const response = await api.getQuestById(questId);
      
      set({
        currentQuest: response.quest || response,
        isLoading: false,
      });

      return response.quest || response;
    } catch (error) {
      console.error('Fetch quest error:', error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  placeBet: async (questId, option, amount) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.placeBet(questId, { option, amount });

      // Update local state
      const quests = get().quests.map(q => {
        if (q.id === questId) {
          return {
            ...q,
            [`pool_${option}`]: q[`pool_${option}`] + amount,
            total_pool: q.total_pool + amount,
            participant_count: q.participant_count + 1,
          };
        }
        return q;
      });

      set({
        quests,
        isLoading: false,
      });

      return response;
    } catch (error) {
      console.error('Place bet error:', error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchMyPredictions: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getMyPredictions(params);
      
      set({
        myPredictions: response.predictions || response,
        isLoading: false,
      });

      return response.predictions || response;
    } catch (error) {
      console.error('Fetch predictions error:', error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set({
      filters: { ...get().filters, ...newFilters },
    });
  },

  clearCurrentQuest: () => {
    set({ currentQuest: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
