/**
 * MintIQ UI Store - FIXED
 * 
 * Key Fixes:
 * - Celebration no longer auto-dismisses (component handles it)
 * - Added clearCelebration for manual dismissal
 */

import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // Modal state
  modal: {
    isOpen: false,
    type: null,
    props: {},
  },

  // Toast notifications
  toasts: [],

  // Loading states
  isGlobalLoading: false,

  // Bottom sheet
  bottomSheet: {
    isOpen: false,
    content: null,
  },

  // Tab bar visibility
  isTabBarVisible: true,

  // Actions
  openModal: (type, props = {}) => {
    set({
      modal: {
        isOpen: true,
        type,
        props,
      },
    });
  },

  closeModal: () => {
    set({
      modal: {
        isOpen: false,
        type: null,
        props: {},
      },
    });
  },

  showToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };

    set({
      toasts: [...get().toasts, toast],
    });

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set({
      toasts: get().toasts.filter((t) => t.id !== id),
    });
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  setGlobalLoading: (isLoading) => {
    set({ isGlobalLoading: isLoading });
  },

  openBottomSheet: (content) => {
    set({
      bottomSheet: {
        isOpen: true,
        content,
      },
    });
  },

  closeBottomSheet: () => {
    set({
      bottomSheet: {
        isOpen: false,
        content: null,
      },
    });
  },

  setTabBarVisible: (visible) => {
    set({ isTabBarVisible: visible });
  },

  // Celebration animations - FIXED: No auto-dismiss, component handles it
  celebration: null,

  showCelebration: (type, data = {}) => {
    set({ celebration: { type, data } });
    // Don't auto-dismiss - the Celebration component has its own countdown and dismiss logic
  },

  clearCelebration: () => {
    set({ celebration: null });
  },
}));
