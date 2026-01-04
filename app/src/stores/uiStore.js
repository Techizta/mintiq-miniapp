/**
 * MintIQ UI Store
 */

import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  toast: null,
  celebration: null,
  modal: null,

  showToast: (message, type = 'info', duration = 3000) => {
    set({ toast: { message, type, id: Date.now() } });
    
    setTimeout(() => {
      set(state => {
        if (state.toast?.id === get().toast?.id) {
          return { toast: null };
        }
        return state;
      });
    }, duration);
  },

  hideToast: () => {
    set({ toast: null });
  },

  showCelebration: (type, data = {}) => {
    set({ celebration: { type, data, id: Date.now() } });
    
    setTimeout(() => {
      set({ celebration: null });
    }, 3000);
  },

  hideCelebration: () => {
    set({ celebration: null });
  },

  showModal: (type, data = {}) => {
    set({ modal: { type, data } });
  },

  hideModal: () => {
    set({ modal: null });
  }
}));

export default useUIStore;
