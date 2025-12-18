/**
 * MintIQ API Service
 * Handles all API communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.mintiq.world';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status + ": " + response.statusText);
        }
        return null;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "HTTP " + response.status);
      }
      return data;
    } catch (error) {
      console.error("API Error [" + endpoint + "]:", error);
      throw error;
    }
  }

  // GET request
  get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  async authenticate(initData) {
    return this.post('/api/miniapp/auth', { initData });
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  async getProfile() {
    return this.get('/api/miniapp/user/profile');
  }

  async getBalance() {
    return this.get('/api/miniapp/user/balance');
  }

  async getStats() {
    return this.get('/api/miniapp/user/stats');
  }

  async updateSettings(settings) {
    return this.put('/api/miniapp/user/settings', settings);
  }

  async getTransactions(params = {}) {
    return this.get('/api/miniapp/user/transactions', params);
  }

  // ============================================
  // QUEST ENDPOINTS
  // ============================================

  async getQuests(params = {}) {
    return this.get('/api/miniapp/quests', params);
  }

  async getQuestById(questId) {
    return this.get(`/api/miniapp/quests/${questId}`);
  }

  async placeBet(questId, data) {
    return this.post(`/api/miniapp/quests/${questId}/bet`, data);
  }

  async getMyPredictions(params = {}) {
    return this.get('/api/miniapp/predictions', params);
  }

  // ============================================
  // EARN ENDPOINTS
  // ============================================

  async getDailyReward() {
    return this.get('/api/miniapp/earn/daily');
  }

  async claimDailyReward() {
    return this.post('/api/miniapp/earn/daily/claim');
  }

  async spinWheel() {
    return this.post('/api/miniapp/earn/spin');
  }

  async getTasks() {
    return this.get('/api/miniapp/earn/tasks');
  }

  async startTask(taskId) {
    return this.post(`/api/miniapp/earn/tasks/${taskId}/start`);
  }

  async verifyTask(taskId, data = {}) {
    return this.post(`/api/miniapp/earn/tasks/${taskId}/verify`, data);
  }

  async watchAd() {
    return this.post('/api/miniapp/earn/watch-ad');
  }

  // ============================================
  // SOCIAL ENDPOINTS
  // ============================================

  async getFriends() {
    return this.get('/api/miniapp/friends');
  }

  async getFriendRequests() {
    return this.get('/api/miniapp/friends/requests');
  }

  async addFriend(username) {
    return this.post('/api/miniapp/friends/add', { username });
  }

  async acceptFriend(friendId) {
    return this.post(`/api/miniapp/friends/${friendId}/accept`);
  }

  async declineFriend(friendId) {
    return this.post(`/api/miniapp/friends/${friendId}/decline`);
  }

  async removeFriend(friendId) {
    return this.delete(`/api/miniapp/friends/${friendId}`);
  }

  // ============================================
  // CHALLENGE ENDPOINTS
  // ============================================

  async getChallenges(params = {}) {
    return this.get('/api/miniapp/challenges', params);
  }

  async createChallenge(data) {
    return this.post('/api/miniapp/challenges', data);
  }

  async acceptChallenge(challengeId) {
    return this.post(`/api/miniapp/challenges/${challengeId}/accept`);
  }

  async declineChallenge(challengeId) {
    return this.post(`/api/miniapp/challenges/${challengeId}/decline`);
  }

  // ============================================
  // GROUP ENDPOINTS
  // ============================================

  async getGroups() {
    return this.get('/api/miniapp/groups');
  }

  async createGroup(data) {
    return this.post('/api/miniapp/groups', data);
  }

  async getGroupById(groupId) {
    return this.get(`/api/miniapp/groups/${groupId}`);
  }

  async joinGroup(inviteCode) {
    return this.post('/api/miniapp/groups/join', { inviteCode });
  }

  async leaveGroup(groupId) {
    return this.post(`/api/miniapp/groups/${groupId}/leave`);
  }

  async getGroupQuests(groupId) {
    return this.get(`/api/miniapp/groups/${groupId}/quests`);
  }

  async createGroupQuest(groupId, data) {
    return this.post(`/api/miniapp/groups/${groupId}/quests`, data);
  }

  async resolveGroupQuest(groupId, questId, data) {
    return this.post(`/api/miniapp/groups/${groupId}/quests/${questId}/resolve`, data);
  }

  // ============================================
  // VAULT ENDPOINTS
  // ============================================

  async getVaultStatus() {
    return this.get('/api/miniapp/vault');
  }

  async getRedemptionInfo() {
    return this.get('/api/redemption/info');
  }

  async requestRedemption(data) {
    return this.post('/api/redemption/request', data);
  }

  // ============================================
  // LEADERBOARD ENDPOINTS
  // ============================================

  async getLeaderboard(type = 'global', params = {}) {
    return this.get(`/api/miniapp/leaderboard/${type}`, params);
  }

  // ============================================
  // SHOP ENDPOINTS
  // ============================================

  async getShopItems() {
    return this.get('/api/miniapp/shop/items');
  }

  async purchaseItem(itemId) {
    return this.post(`/api/miniapp/shop/purchase/${itemId}`);
  }

  async getBoosters() {
    return this.get('/api/miniapp/shop/boosters');
  }

  async activateBooster(boosterId) {
    return this.post(`/api/miniapp/shop/boosters/${boosterId}/activate`);
  }
}

// Export singleton instance
export const api = new ApiService();
export default api;
