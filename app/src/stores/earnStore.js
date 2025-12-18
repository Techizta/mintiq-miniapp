import { create } from 'zustand';
import api from '../services/api';

export const useEarnStore = create((set, get) => ({
  // State
  dailyReward: null,
  streakInfo: null,
  tasks: [],
  spinResult: null,
  isLoading: false,
  error: null,
  adsWatchedToday: 0,
  maxAdsPerDay: 5,

  // Actions
  fetchDailyReward: async () => {
    set({ isLoading: true, error: null });

    try {
      // Development mode
      if (import.meta.env.DEV) {
        await new Promise(r => setTimeout(r, 300));
        const mockData = {
          canClaim: true,
          currentStreak: 5,
          streakReward: 250,
          nextStreakReward: 400,
          lastClaimed: null,
          weeklyBonus: false,
          mysteryBoxChance: 10,
        };
        set({
          dailyReward: mockData,
          streakInfo: {
            current: 5,
            best: 12,
            todayReward: 250,
            weekProgress: [true, true, true, true, true, false, false],
          },
          isLoading: false,
        });
        return mockData;
      }

      const response = await api.getDailyReward();
      
      set({
        dailyReward: response,
        streakInfo: response.streakInfo,
        isLoading: false,
      });

      return response;
    } catch (error) {
      console.error('Fetch daily reward error:', error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  claimDailyReward: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.claimDailyReward();
      
      // Update local state
      set({
        dailyReward: {
          ...get().dailyReward,
          canClaim: false,
          lastClaimed: new Date().toISOString(),
        },
        isLoading: false,
      });

      return response;
    } catch (error) {
      console.error('Claim daily reward error:', error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  spinWheel: async () => {
    set({ isLoading: true, error: null, spinResult: null });

    try {
      // Development mode - simulate spin
      if (import.meta.env.DEV) {
        await new Promise(r => setTimeout(r, 500));
        const rewards = [10, 15, 20, 25, 30, 40, 50, 75, 100];
        const result = rewards[Math.floor(Math.random() * rewards.length)];
        set({
          spinResult: { amount: result, type: 'satz' },
          isLoading: false,
        });
        return { amount: result, type: 'satz' };
      }

      const response = await api.spinWheel();
      
      set({
        spinResult: response,
        isLoading: false,
      });

      return response;
    } catch (error) {
      console.error('Spin wheel error:', error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null });

    try {
      // Development mode
      if (import.meta.env.DEV) {
        await new Promise(r => setTimeout(r, 400));
        const mockTasks = [
          {
            id: 1,
            name: 'Join CryptoNews Channel',
            description: 'Join our partner channel for daily updates',
            task_type: 'channel_join',
            target_channel: '@CryptoNewsDaily',
            user_reward_satz: 100,
            completed: false,
          },
          {
            id: 2,
            name: 'Visit DeFi Protocol',
            description: 'Visit and explore the DeFi dashboard',
            task_type: 'website_visit',
            target_url: 'https://example.com',
            required_seconds: 30,
            user_reward_satz: 75,
            completed: false,
          },
          {
            id: 3,
            name: 'Follow on Twitter',
            description: 'Follow @MintIQWorld on Twitter',
            task_type: 'twitter_follow',
            target_url: 'https://twitter.com/MintIQWorld',
            user_reward_satz: 200,
            completed: true,
          },
        ];
        set({
          tasks: mockTasks,
          isLoading: false,
        });
        return mockTasks;
      }

      const response = await api.getTasks();
      
      set({
        tasks: response.tasks || response,
        isLoading: false,
      });

      return response.tasks || response;
    } catch (error) {
      console.error('Fetch tasks error:', error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  startTask: async (taskId) => {
    try {
      const response = await api.startTask(taskId);
      return response;
    } catch (error) {
      console.error('Start task error:', error);
      throw error;
    }
  },

  verifyTask: async (taskId, data = {}) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.verifyTask(taskId, data);
      
      // Update task as completed
      const tasks = get().tasks.map(t =>
        t.id === taskId ? { ...t, completed: true } : t
      );

      set({
        tasks,
        isLoading: false,
      });

      return response;
    } catch (error) {
      console.error('Verify task error:', error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  watchAd: async () => {
    const { adsWatchedToday, maxAdsPerDay } = get();
    
    if (adsWatchedToday >= maxAdsPerDay) {
      throw new Error('Daily ad limit reached');
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.watchAd();
      
      set({
        adsWatchedToday: adsWatchedToday + 1,
        isLoading: false,
      });

      return response;
    } catch (error) {
      console.error('Watch ad error:', error);
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  clearSpinResult: () => {
    set({ spinResult: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
