/**
 * MintIQ API Service
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
    this.token = null;
    this.initData = null;
  }

  // Initialize with Telegram data
  init(initData) {
    this.initData = initData;
  }

  // Set JWT token for authenticated requests
  setToken(token) {
    this.token = token;
    console.log('[MintIQ API] Token set');
  }

  // Clear token (logout)
  clearToken() {
    this.token = null;
    console.log('[MintIQ API] Token cleared');
  }

  // Get auth headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add JWT token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add Telegram init data
    if (this.initData) {
      headers['X-Telegram-Init-Data'] = this.initData;
    }

    // Try to get from WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
      headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
    }

    return headers;
  }

  // Generic request handler
  async request(method, endpoint, data = null, params = null) {
    let url = `${this.baseUrl}${endpoint}`;

    // Add query params
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      console.log(`[MintIQ API] ${method} ${endpoint}`);
      const response = await fetch(url, options);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return null;
      }

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || json.message || `HTTP ${response.status}`);
      }

      return json;
    } catch (error) {
      console.error(`[MintIQ API] ${method} ${endpoint} error:`, error.message);
      throw error;
    }
  }

  // Convenience methods
  get(endpoint, params = null) {
    return this.request('GET', endpoint, null, params);
  }

  post(endpoint, data = null) {
    return this.request('POST', endpoint, data);
  }

  put(endpoint, data = null) {
    return this.request('PUT', endpoint, data);
  }

  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  
  // Authenticate with Telegram initData
  async authenticate(initData) {
    const response = await this.post('/api/miniapp/auth', { initData });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // ==========================================
  // USER PROFILE
  // ==========================================
  
  getProfile() {
    return this.get('/api/miniapp/user/profile');
  }

  updateProfile(data) {
    return this.put('/api/miniapp/user/profile', data);
  }

  getBalance() {
    return this.get('/api/miniapp/user/balance');
  }

  getTransactions(params) {
    return this.get('/api/miniapp/user/transactions', params);
  }

  // ==========================================
  // QUESTS / POOLS
  // ==========================================
  
  getQuests(params) {
    return this.get('/api/miniapp/quests', params);
  }

  getQuest(id) {
    return this.get(`/api/miniapp/quests/${id}`);
  }

  placeBet(questId, data) {
    return this.post(`/api/miniapp/quests/${questId}/predict`, data);
  }

  // ==========================================
  // DAILY REWARDS
  // ==========================================
  
  getDailyReward() {
    return this.get('/api/miniapp/daily-check');
  }

  claimDailyReward() {
    return this.post('/api/miniapp/daily-check/claim');
  }

  // ==========================================
  // EARN / TASKS
  // ==========================================
  
  getTasks() {
    return this.get('/api/miniapp/tasks');
  }

  completeTask(taskId) {
    return this.post(`/api/miniapp/tasks/${taskId}/complete`);
  }

  getSpinStatus() {
    return this.get('/api/miniapp/earn/spin/status');
  }

  spin() {
    return this.post('/api/miniapp/earn/spin');
  }

  // ==========================================
  // REFERRALS / FRIENDS
  // ==========================================
  
  getFriends() {
    return this.get('/api/miniapp/friends');
  }

  getReferralStats() {
    return this.get('/api/miniapp/referral/stats');
  }

  // ==========================================
  // LEADERBOARD
  // ==========================================
  
  getLeaderboard(params) {
    return this.get('/api/miniapp/leaderboard', params);
  }

  // ==========================================
  // HOME PAGE DATA
  // ==========================================
  
  getFeaturedQuest() {
    return this.get('/api/miniapp/home/featured');
  }

  getLiveActivity() {
    return this.get('/api/miniapp/live/activity');
  }

  getWithdrawalProgress() {
    return this.get('/api/miniapp/withdrawal/progress');
  }

  // ==========================================
  // BOOSTERS
  // ==========================================
  
  getActiveBooster() {
    return this.get('/api/miniapp/boosters/active');
  }

  getBoosterConfig() {
    return this.get('/api/miniapp/boosters/config');
  }

  activateBooster(boosterId) {
    return this.post('/api/miniapp/boosters/activate', { boosterId });
  }

  // ==========================================
  // PREMIUM
  // ==========================================
  
  getPremiumStatus() {
    return this.get('/api/miniapp/premium/status');
  }

  // ==========================================
  // ADS
  // ==========================================
  
  claimAdReward(data) {
    return this.post('/api/miniapp/ads/reward', data);
  }
}

const api = new ApiService();
export default api;
