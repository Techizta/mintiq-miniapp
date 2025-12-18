/**
 * Adsgram Rewarded Ads Service
 * Block ID: int-19315
 * Docs: https://docs.adsgram.ai
 */

class AdsgramService {
  constructor() {
    this.blockId = 'int-19315';
    this.adController = null;
    this.isReady = false;
  }

  init() {
    return new Promise((resolve) => {
      // Check if window exists
      if (typeof window === 'undefined') {
        console.warn('[Adsgram] No window object');
        resolve(false);
        return;
      }

      // Check if already initialized
      if (this.isReady && this.adController) {
        console.log('[Adsgram] Already initialized');
        resolve(true);
        return;
      }

      // Check if Adsgram SDK is loaded
      if (!window.Adsgram) {
        console.warn('[Adsgram] SDK not loaded on window');
        resolve(false);
        return;
      }

      try {
        // Initialize Adsgram
        this.adController = window.Adsgram.init({ blockId: this.blockId });
        this.isReady = true;
        console.log('[Adsgram] Initialized successfully', this.adController);
        resolve(true);
      } catch (error) {
        console.error('[Adsgram] Init error:', error);
        resolve(false);
      }
    });
  }

  async showAd() {
    console.log('[Adsgram] showAd called');
    
    // Check window.Adsgram directly each time
    if (typeof window === 'undefined' || !window.Adsgram) {
      console.error('[Adsgram] SDK not available');
      throw new Error('Ads not available');
    }

    // Reinitialize if needed
    if (!this.adController) {
      try {
        this.adController = window.Adsgram.init({ blockId: this.blockId });
        console.log('[Adsgram] Reinitialized', this.adController);
      } catch (e) {
        console.error('[Adsgram] Reinit failed:', e);
        throw new Error('Ads not available');
      }
    }

    // Log what adController looks like
    console.log('[Adsgram] adController type:', typeof this.adController);
    console.log('[Adsgram] adController:', this.adController);
    console.log('[Adsgram] adController.show type:', typeof this.adController?.show);

    // Try to call show
    if (!this.adController || typeof this.adController.show !== 'function') {
      console.error('[Adsgram] show is not a function. adController:', this.adController);
      
      // Try alternative approach - maybe show is a property not a method
      if (this.adController && this.adController.show) {
        console.log('[Adsgram] show exists but is:', typeof this.adController.show, this.adController.show);
      }
      
      throw new Error('Ads not available right now');
    }

    try {
      console.log('[Adsgram] Calling show()...');
      const result = await this.adController.show();
      console.log('[Adsgram] Show result:', result);
      
      if (result.done) {
        return { success: true, reward: true };
      } else {
        return { success: true, reward: false, reason: result.description || 'skipped' };
      }
    } catch (error) {
      console.error('[Adsgram] Show error:', error);
      // User closed the ad or error occurred
      if (error.description) {
        throw new Error(error.description);
      }
      throw new Error('Ad was closed or failed to load');
    }
  }

  isAvailable() {
    const available = typeof window !== 'undefined' && !!window.Adsgram;
    console.log('[Adsgram] isAvailable:', available);
    return available;
  }
}

const adsgramService = new AdsgramService();
export default adsgramService;
