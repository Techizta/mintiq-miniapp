/**
 * Adsgram Rewarded Ads Service
 * Block ID: int-19315
 */

class AdsgramService {
  constructor() {
    this.blockId = 'int-19315';
    this.adController = null;
    this.isReady = false;
  }

  init() {
    if (typeof window === 'undefined' || typeof window.Adsgram === 'undefined') {
      console.warn('Adsgram SDK not loaded');
      return false;
    }
    
    try {
      this.adController = window.Adsgram.init({ blockId: this.blockId });
      this.isReady = true;
      console.log('✅ Adsgram initialized');
      return true;
    } catch (error) {
      console.error('Adsgram init error:', error);
      return false;
    }
  }

  async showAd() {
    return new Promise((resolve, reject) => {
      if (!this.isReady || !this.adController) {
        if (!this.init()) {
          reject(new Error('Adsgram not available'));
          return;
        }
      }

      this.adController.show()
        .then((result) => {
          if (result.done) {
            resolve({ success: true, reward: true });
          } else {
            resolve({ success: true, reward: false, reason: 'skipped' });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  isAvailable() {
    return typeof window !== 'undefined' && typeof window.Adsgram !== 'undefined';
  }
}

const adsgramService = new AdsgramService();
export default adsgramService;
