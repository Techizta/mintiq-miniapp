import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import telegram from '../services/telegram';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      isInitialized: false,
      isAuthenticated: false,
      token: null,
      error: null,

      // Actions
      initialize: async () => {
        try {
          // Check if we have Telegram initData
          const initData = telegram.initData;
          
          if (initData) {
            // Authenticate with backend
            const response = await api.authenticate(initData);
            
            if (response.token) {
              api.setToken(response.token);
              set({
                isInitialized: true,
                isAuthenticated: true,
                token: response.token,
                error: null,
              });
              return;
            }
          }
          
          // Check for existing token
          const existingToken = get().token;
          if (existingToken) {
            api.setToken(existingToken);
            set({ isInitialized: true, isAuthenticated: true });
            return;
          }

          // No auth available - for development
          if (import.meta.env.DEV) {
            console.log('Development mode: Using mock auth');
            set({ isInitialized: true, isAuthenticated: true });
            return;
          }

          // Not authenticated
          set({ isInitialized: true, isAuthenticated: false });
          
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            isInitialized: true,
            isAuthenticated: false,
            error: error.message,
          });
        }
      },

      setToken: (token) => {
        api.setToken(token);
        set({ token, isAuthenticated: !!token });
      },

      logout: () => {
        api.clearToken();
        set({
          isAuthenticated: false,
          token: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'mintiq-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
