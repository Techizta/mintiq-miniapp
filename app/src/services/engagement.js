/**
 * MintIQ Engagement Service
 * Handles activity feed, badges, comebacks, and social features
 */

import api from './api';

class EngagementService {
  constructor() {
    this.cache = {
      activity: null,
      activityTimestamp: 0,
      stats: null,
      statsTimestamp: 0,
    };
    this.CACHE_TTL = 30000; // 30 seconds
  }

  // ============================================
  // ACTIVITY FEED
  // ============================================

  async getActivity(limit = 20, forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this.cache.activity && (now - this.cache.activityTimestamp < this.CACHE_TTL)) {
      return this.cache.activity;
    }

    try {
      const data = await api.get('/api/miniapp/engagement/activity', { limit });
      this.cache.activity = data;
      this.cache.activityTimestamp = now;
      return data;
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      return this.cache.activity || { activities: [], count: 0 };
    }
  }

  async getQuickStats(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this.cache.stats && (now - this.cache.statsTimestamp < this.CACHE_TTL)) {
      return this.cache.stats;
    }

    try {
      const data = await api.get('/api/miniapp/engagement/stats');
      this.cache.stats = data;
      this.cache.statsTimestamp = now;
      return data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return this.cache.stats || { wins24h: 0, won24h: 0, activeNow: 0, totalUsers: 0 };
    }
  }

  async getTrending(limit = 3) {
    try {
      return await api.get('/api/miniapp/engagement/trending', { limit });
    } catch (error) {
      console.error('Failed to fetch trending:', error);
      return { predictions: [] };
    }
  }

  // ============================================
  // SHARING
  // ============================================

  async trackShare(type, referenceId = null, platform = 'telegram') {
    try {
      return await api.post('/api/miniapp/engagement/share', {
        type,
        referenceId,
        platform,
      });
    } catch (error) {
      console.error('Failed to track share:', error);
      return null;
    }
  }

  async getWinCard(predictionId) {
    try {
      return await api.get(`/api/miniapp/engagement/share/card/${predictionId}`);
    } catch (error) {
      console.error('Failed to get win card:', error);
      return null;
    }
  }

  generateShareText(type, data = {}) {
    const botUsername = 'MintIQBot';
    const baseUrl = `https://t.me/${botUsername}`;

    switch (type) {
      case 'win':
        return {
          text: `🏆 I just won ${data.amount} SATZ on MintIQ!\n\n"${data.questTitle}"\n\nPredict & win crypto! 🚀`,
          url: data.referralCode ? `${baseUrl}?start=ref_${data.referralCode}` : baseUrl,
        };
      case 'streak':
        return {
          text: `🔥 ${data.days} day streak on MintIQ!\n\nI've been making predictions every day. Can you beat my streak?`,
          url: data.referralCode ? `${baseUrl}?start=ref_${data.referralCode}` : baseUrl,
        };
      case 'tier':
        return {
          text: `🎉 Just reached ${data.tier} tier on MintIQ!\n\nJoin me and start predicting! 💎`,
          url: data.referralCode ? `${baseUrl}?start=ref_${data.referralCode}` : baseUrl,
        };
      case 'referral':
        return {
          text: `🎮 Join me on MintIQ - the prediction game!\n\nMake predictions, win SATZ, redeem for real crypto! 🚀`,
          url: `${baseUrl}?start=ref_${data.referralCode}`,
        };
      default:
        return {
          text: '🎮 Check out MintIQ - the prediction game!',
          url: baseUrl,
        };
    }
  }

  shareToTelegram(type, data = {}) {
    const { text, url } = this.generateShareText(type, data);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    
    // Track the share
    this.trackShare(type, data.referenceId, 'telegram');
    
    // Open share dialog
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  }

  // ============================================
  // COMEBACK BONUS
  // ============================================

  async checkComebackEligibility() {
    try {
      return await api.get('/api/miniapp/engagement/comeback');
    } catch (error) {
      console.error('Failed to check comeback:', error);
      return { eligible: false };
    }
  }

  async claimComebackBonus() {
    try {
      return await api.post('/api/miniapp/engagement/comeback/claim');
    } catch (error) {
      console.error('Failed to claim comeback:', error);
      throw error;
    }
  }

  // ============================================
  // CHANNEL TASK
  // ============================================

  async checkChannelStatus() {
    try {
      return await api.get('/api/miniapp/engagement/channel/status');
    } catch (error) {
      console.error('Failed to check channel status:', error);
      return { isMember: false, hasClaimed: false };
    }
  }

  async claimChannelBonus() {
    try {
      return await api.post('/api/miniapp/engagement/channel/claim');
    } catch (error) {
      console.error('Failed to claim channel bonus:', error);
      throw error;
    }
  }

  openChannel() {
    const channelUrl = 'https://t.me/MintIQCommunity';
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(channelUrl);
    } else {
      window.open(channelUrl, '_blank');
    }
  }

  // ============================================
  // BADGES
  // ============================================

  async getBadges() {
    try {
      return await api.get('/api/miniapp/engagement/badges');
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      return { earned: [], available: [] };
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  formatSatz(amount) {
    const num = parseInt(amount) || 0;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  clearCache() {
    this.cache = {
      activity: null,
      activityTimestamp: 0,
      stats: null,
      statsTimestamp: 0,
    };
  }
}

export const engagementService = new EngagementService();
export default engagementService;
