/**
 * MintIQ Telegram Service
 */

class TelegramService {
  constructor() {
    this.webapp = null;
  }

  // Initialize
  init() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webapp = window.Telegram.WebApp;
    }
    return this;
  }

  // Get WebApp instance
  get webApp() {
    return this.webapp;
  }

  // Check if Telegram WebApp is available
  get isAvailable() {
    return !!(this.webapp || (typeof window !== 'undefined' && window.Telegram?.WebApp));
  }

  // Ready signal
  ready() {
    this.webapp?.ready();
  }

  // Expand to full screen
  expand() {
    this.webapp?.expand();
  }

  // Close app
  close() {
    this.webapp?.close();
  }

  // Get init data
  get initData() {
    return this.webapp?.initData || '';
  }

  // Get init data unsafe (parsed)
  get initDataUnsafe() {
    return this.webapp?.initDataUnsafe || {};
  }

  // Get user
  get user() {
    return this.webapp?.initDataUnsafe?.user || null;
  }

  // Get start param
  get startParam() {
    return this.webapp?.initDataUnsafe?.start_param || null;
  }

  // Haptic feedback
  hapticImpact(style = 'medium') {
    try {
      this.webapp?.HapticFeedback?.impactOccurred(style);
    } catch (e) {
      // Fallback: vibrate if available
      if (navigator.vibrate) {
        const durations = { light: 10, medium: 20, heavy: 30 };
        navigator.vibrate(durations[style] || 20);
      }
    }
  }

  hapticNotification(type = 'success') {
    try {
      this.webapp?.HapticFeedback?.notificationOccurred(type);
    } catch (e) {
      if (navigator.vibrate) {
        navigator.vibrate(type === 'error' ? [50, 50, 50] : 50);
      }
    }
  }

  hapticSelection() {
    try {
      this.webapp?.HapticFeedback?.selectionChanged();
    } catch (e) {
      // Silent fail
    }
  }

  // Open link
  openLink(url, options = {}) {
    try {
      if (options.tryInstantView) {
        this.webapp?.openLink(url, { try_instant_view: true });
      } else {
        this.webapp?.openLink(url);
      }
    } catch (e) {
      window.open(url, '_blank');
    }
  }

  // Open Telegram link
  openTelegramLink(url) {
    try {
      this.webapp?.openTelegramLink(url);
    } catch (e) {
      window.open(url, '_blank');
    }
  }

  // Share URL
  shareUrl(url, text = '') {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    this.openTelegramLink(shareUrl);
  }

  // Open invoice (Stars payment)
  openInvoice(url, callback) {
    try {
      this.webapp?.openInvoice(url, callback);
    } catch (e) {
      console.error('Invoice error:', e);
      callback?.('failed');
    }
  }

  // Show popup
  showPopup(params, callback) {
    try {
      this.webapp?.showPopup(params, callback);
    } catch (e) {
      // Fallback to browser alert
      const result = window.confirm(params.message || params.title);
      callback?.(result ? 'ok' : 'cancel');
    }
  }

  // Show alert
  showAlert(message, callback) {
    try {
      this.webapp?.showAlert(message, callback);
    } catch (e) {
      window.alert(message);
      callback?.();
    }
  }

  // Show confirm
  showConfirm(message, callback) {
    try {
      this.webapp?.showConfirm(message, callback);
    } catch (e) {
      const result = window.confirm(message);
      callback?.(result);
    }
  }

  // Set header color
  setHeaderColor(color) {
    try {
      this.webapp?.setHeaderColor(color);
    } catch (e) {
      // Silent fail
    }
  }

  // Set background color
  setBackgroundColor(color) {
    try {
      this.webapp?.setBackgroundColor(color);
    } catch (e) {
      // Silent fail
    }
  }

  // Enable/disable closing confirmation
  enableClosingConfirmation() {
    try {
      this.webapp?.enableClosingConfirmation();
    } catch (e) {}
  }

  disableClosingConfirmation() {
    try {
      this.webapp?.disableClosingConfirmation();
    } catch (e) {}
  }

  // Main button
  showMainButton(text, callback, options = {}) {
    try {
      const btn = this.webapp?.MainButton;
      if (btn) {
        btn.text = text;
        btn.onClick(callback);
        if (options.color) btn.color = options.color;
        if (options.textColor) btn.textColor = options.textColor;
        btn.show();
      }
    } catch (e) {}
  }

  hideMainButton() {
    try {
      this.webapp?.MainButton?.hide();
    } catch (e) {}
  }

  // Back button
  showBackButton(callback) {
    try {
      const btn = this.webapp?.BackButton;
      if (btn) {
        btn.onClick(callback);
        btn.show();
      }
    } catch (e) {}
  }

  hideBackButton() {
    try {
      this.webapp?.BackButton?.hide();
    } catch (e) {}
  }

  // Cloud storage
  async getStorageItem(key) {
    return new Promise((resolve) => {
      try {
        this.webapp?.CloudStorage?.getItem(key, (err, value) => {
          resolve(err ? null : value);
        });
      } catch {
        resolve(null);
      }
    });
  }

  async setStorageItem(key, value) {
    return new Promise((resolve) => {
      try {
        this.webapp?.CloudStorage?.setItem(key, value, (err) => {
          resolve(!err);
        });
      } catch {
        resolve(false);
      }
    });
  }

  // Theme
  get colorScheme() {
    return this.webapp?.colorScheme || 'dark';
  }

  get themeParams() {
    return this.webapp?.themeParams || {};
  }

  // Platform
  get platform() {
    return this.webapp?.platform || 'unknown';
  }

  get version() {
    return this.webapp?.version || '0.0';
  }

  // Check if feature supported
  isVersionAtLeast(version) {
    try {
      return this.webapp?.isVersionAtLeast(version) || false;
    } catch {
      return false;
    }
  }
}

const telegram = new TelegramService();
export default telegram;
