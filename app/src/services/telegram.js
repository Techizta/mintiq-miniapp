/**
 * Telegram Mini App Service
 * Wraps Telegram WebApp SDK functionality
 */

class TelegramService {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.isAvailable = !!this.tg;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  get webApp() {
    return this.tg;
  }

  get initData() {
    return this.tg?.initData || '';
  }

  get initDataUnsafe() {
    return this.tg?.initDataUnsafe || {};
  }

  get user() {
    return this.initDataUnsafe.user || null;
  }

  get startParam() {
    return this.initDataUnsafe.start_param || null;
  }

  get colorScheme() {
    return this.tg?.colorScheme || 'dark';
  }

  get themeParams() {
    return this.tg?.themeParams || {};
  }

  get platform() {
    return this.tg?.platform || 'unknown';
  }

  get version() {
    return this.tg?.version || '6.0';
  }

  get viewportHeight() {
    return this.tg?.viewportHeight || window.innerHeight;
  }

  get viewportStableHeight() {
    return this.tg?.viewportStableHeight || window.innerHeight;
  }

  get isExpanded() {
    return this.tg?.isExpanded || false;
  }

  // ============================================
  // METHODS
  // ============================================

  ready() {
    this.tg?.ready();
  }

  expand() {
    this.tg?.expand();
  }

  close() {
    this.tg?.close();
  }

  // ============================================
  // MAIN BUTTON
  // ============================================

  showMainButton(text, onClick, options = {}) {
    if (!this.tg?.MainButton) return;

    const mainButton = this.tg.MainButton;
    
    mainButton.setText(text);
    
    if (options.color) {
      mainButton.setParams({ color: options.color });
    }
    
    if (options.textColor) {
      mainButton.setParams({ text_color: options.textColor });
    }

    // Remove previous listener
    mainButton.offClick(onClick);
    mainButton.onClick(onClick);
    
    if (options.isActive !== false) {
      mainButton.enable();
    } else {
      mainButton.disable();
    }

    if (options.isLoading) {
      mainButton.showProgress();
    } else {
      mainButton.hideProgress();
    }

    mainButton.show();
  }

  hideMainButton() {
    this.tg?.MainButton?.hide();
  }

  setMainButtonLoading(isLoading) {
    if (isLoading) {
      this.tg?.MainButton?.showProgress();
    } else {
      this.tg?.MainButton?.hideProgress();
    }
  }

  // ============================================
  // BACK BUTTON
  // ============================================

  showBackButton(onClick) {
    if (!this.tg?.BackButton) return;
    
    this.tg.BackButton.onClick(onClick);
    this.tg.BackButton.show();
  }

  hideBackButton() {
    this.tg?.BackButton?.hide();
  }

  // ============================================
  // HAPTIC FEEDBACK
  // ============================================

  hapticImpact(style = 'medium') {
    // style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
    this.tg?.HapticFeedback?.impactOccurred(style);
  }

  hapticNotification(type = 'success') {
    // type: 'error' | 'success' | 'warning'
    this.tg?.HapticFeedback?.notificationOccurred(type);
  }

  hapticSelection() {
    this.tg?.HapticFeedback?.selectionChanged();
  }

  // ============================================
  // POPUPS & ALERTS
  // ============================================

  showAlert(message, callback) {
    if (this.tg?.showAlert) {
      this.tg.showAlert(message, callback);
    } else {
      alert(message);
      callback?.();
    }
  }

  showConfirm(message, callback) {
    if (this.tg?.showConfirm) {
      this.tg.showConfirm(message, callback);
    } else {
      const result = confirm(message);
      callback?.(result);
    }
  }

  showPopup(params, callback) {
    if (this.tg?.showPopup) {
      this.tg.showPopup(params, callback);
    }
  }

  // ============================================
  // SHARING & LINKS
  // ============================================

  openLink(url, options = {}) {
    if (this.tg?.openLink) {
      this.tg.openLink(url, options);
    } else {
      window.open(url, '_blank');
    }
  }

  openTelegramLink(url) {
    if (this.tg?.openTelegramLink) {
      this.tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  shareUrl(url, text = '') {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    this.openTelegramLink(shareUrl);
  }

  // ============================================
  // CLIPBOARD
  // ============================================

  async readClipboard() {
    if (this.tg?.readTextFromClipboard) {
      return new Promise((resolve) => {
        this.tg.readTextFromClipboard(resolve);
      });
    }
    return navigator.clipboard.readText();
  }

  async writeClipboard(text) {
    return navigator.clipboard.writeText(text);
  }

  // ============================================
  // QR SCANNER
  // ============================================

  showQRScanner(text, callback) {
    if (this.tg?.showScanQrPopup) {
      this.tg.showScanQrPopup({ text }, callback);
    }
  }

  closeQRScanner() {
    this.tg?.closeScanQrPopup();
  }

  // ============================================
  // THEME & COLORS
  // ============================================

  setHeaderColor(color) {
    this.tg?.setHeaderColor(color);
  }

  setBackgroundColor(color) {
    this.tg?.setBackgroundColor(color);
  }

  // ============================================
  // CLOUD STORAGE
  // ============================================

  async getStorageItem(key) {
    if (!this.tg?.CloudStorage) return null;
    
    return new Promise((resolve) => {
      this.tg.CloudStorage.getItem(key, (error, value) => {
        resolve(error ? null : value);
      });
    });
  }

  async setStorageItem(key, value) {
    if (!this.tg?.CloudStorage) return false;
    
    return new Promise((resolve) => {
      this.tg.CloudStorage.setItem(key, value, (error) => {
        resolve(!error);
      });
    });
  }

  async removeStorageItem(key) {
    if (!this.tg?.CloudStorage) return false;
    
    return new Promise((resolve) => {
      this.tg.CloudStorage.removeItem(key, (error) => {
        resolve(!error);
      });
    });
  }

  // ============================================
  // BIOMETRIC
  // ============================================

  get isBiometricAvailable() {
    return this.tg?.BiometricManager?.isInited && 
           this.tg?.BiometricManager?.isBiometricAvailable;
  }

  async requestBiometric() {
    if (!this.tg?.BiometricManager) return false;
    
    return new Promise((resolve) => {
      this.tg.BiometricManager.authenticate({
        reason: 'Confirm your identity'
      }, (success) => {
        resolve(success);
      });
    });
  }

  // ============================================
  // EVENTS
  // ============================================

  onEvent(eventType, callback) {
    this.tg?.onEvent(eventType, callback);
  }

  offEvent(eventType, callback) {
    this.tg?.offEvent(eventType, callback);
  }

  // ============================================
  // INVOICE
  // ============================================

  openInvoice(url, callback) {
    if (this.tg?.openInvoice) {
      this.tg.openInvoice(url, callback);
    }
  }

  // ============================================
  // SETTINGS BUTTON
  // ============================================

  showSettingsButton(onClick) {
    if (!this.tg?.SettingsButton) return;
    
    this.tg.SettingsButton.onClick(onClick);
    this.tg.SettingsButton.show();
  }

  hideSettingsButton() {
    this.tg?.SettingsButton?.hide();
  }
}

// Export singleton instance
export const telegram = new TelegramService();
export default telegram;
