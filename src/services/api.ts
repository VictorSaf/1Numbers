// API Service Configuration
import { API_BASE } from '@/lib/apiBase';
import type { ProfileCategory } from '@/lib/profileCategories';

const API_BASE_URL = API_BASE;

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Try to restore token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = config;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      // A 401 means the token this client is holding is no longer accepted --
      // it expired mid-session, or it was signed with a secret that has since
      // been rotated. Nothing in the app inspected the status, so the UI stayed
      // logged in with every request failing behind it. Signing out here is the
      // only honest reading of the answer.
      //
      // /auth/* is excluded: a wrong password is also a 401, and bouncing the
      // sign-in page to itself would hide the message that says so.
      if (response.status === 401 && !endpoint.startsWith('/auth/')) {
        this.setToken(null);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
          const back = window.location.pathname + window.location.search;
          window.location.assign(`/auth?redirect=${encodeURIComponent(back)}`);
        }
      }

      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || error.details || 'Request failed';
      const apiError = new Error(errorMessage) as Error & { status?: number };
      apiError.status = response.status;
      throw apiError;
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ success: boolean; user: unknown; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(email: string, password: string, name?: string) {
    return this.request<{ success: boolean; user: unknown; token: string }>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    });
  }

  async logout() {
    // Clear token locally, backend doesn't need to do anything for JWT
    this.setToken(null);
    return Promise.resolve();
  }

  async getCurrentUser() {
    return this.request<{ success: boolean; user: unknown }>('/auth/me');
  }

  // Profile endpoints
  async getProfile() {
    return this.request<{ success: boolean; profile: unknown | null }>('/profiles/me');
  }

  async getAllProfiles() {
    return this.request<{ success: boolean; profiles: unknown[] }>('/profiles/all');
  }

  async createProfile(data: {
    fullName: string;
    birthDate: string;
    birthTime?: string;
    birthPlace?: string;
    category?: ProfileCategory;
    setAsActive?: boolean;
  }) {
    return this.request<{ success: boolean; profile: unknown }>('/profiles/me', {
      method: 'POST',
      body: data,
    });
  }

  async updateProfile(
    profileId: string,
    data: {
      fullName: string;
      birthDate: string;
      birthTime?: string;
      birthPlace?: string;
      category?: ProfileCategory;
    },
  ) {
    return this.request<{ success: boolean; profile: unknown }>(`/profiles/${profileId}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteProfile(profileId?: string) {
    const endpoint = profileId ? `/profiles/${profileId}` : '/profiles/me';
    return this.request<{ success: boolean; message: string }>(endpoint, { method: 'DELETE' });
  }

  async setActiveProfile(profileId: string) {
    return this.request<{ success: boolean; profile: unknown }>(`/profiles/${profileId}/activate`, {
      method: 'POST',
    });
  }

  /**
   * Ziua, scrisă de model o dată pe zi.
   *
   * Propozițiile adevărate pleacă de aici -- motorul de arhetipuri stă în
   * frontend -- iar serverul le dă modelului doar ca să le reformuleze.
   * Serverul verifică singur ziua personală din data nașterii pe care o are.
   */
  async getTodayReading(data: {
    date: string;
    language: 'ro' | 'en' | 'ru';
    personalDay: number;
    composed: { ziua: string; fric: string; aproape: string; intrebare: string };
  }) {
    return this.request<{
      body: { ziua: string; fric: string; aproape: string; intrebare: string };
      source: 'model' | 'composed';
      model?: string;
      /** Ce a scris omul ultima dată la aceeași cifră, citat întocmai. */
      echo?: string;
      cached: boolean;
    }>('/today/reading', { method: 'POST', body: data });
  }

  // Journal endpoints
  async createJournalEntry(data: {
    entryType: 'journal' | 'prediction';
    title: string;
    content?: string;
    date?: string;
    numerologyData?: Record<string, unknown>;
    tags?: string[];
    mood?: string;
  }) {
    return this.request<{ success: boolean; entry: unknown }>('/journal/entry', {
      method: 'POST',
      body: data,
    });
  }

  async getJournalEntries(filters?: {
    entryType?: 'journal' | 'prediction';
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.entryType) params.append('entryType', filters.entryType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const query = params.toString();
    return this.request<{ success: boolean; entries: unknown[]; total: number }>(
      `/journal/entries${query ? `?${query}` : ''}`
    );
  }

  async updateJournalEntry(entryId: string, data: {
    title?: string;
    content?: string;
    date?: string;
    numerologyData?: Record<string, unknown>;
    tags?: string[];
    mood?: string;
  }) {
    return this.request<{ success: boolean; entry: unknown }>(`/journal/entry/${entryId}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteJournalEntry(entryId: string) {
    return this.request<{ success: boolean; message: string }>(`/journal/entry/${entryId}`, {
      method: 'DELETE',
    });
  }

  async getJournalStatistics(filters?: { startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    return this.request<{ success: boolean; statistics: unknown }>(
      `/journal/statistics${query ? `?${query}` : ''}`
    );
  }

  // Subscription endpoints
  async getSubscriptionPlans() {
    return this.request<{ success: boolean; plans: unknown[] }>('/subscriptions/plans');
  }

  async getSubscriptionStatus() {
    return this.request<{ success: boolean; subscription: unknown | null; plan: unknown; isPremium: boolean }>('/subscriptions/status');
  }

  async createSubscription(data: { planId: number; billingPeriod?: 'monthly' | 'yearly' }) {
    return this.request<{ success: boolean; subscription: unknown }>('/subscriptions/create', {
      method: 'POST',
      body: data,
    });
  }

  async cancelSubscription() {
    return this.request<{ success: boolean; message: string; subscription: unknown }>('/subscriptions/cancel', {
      method: 'POST',
    });
  }

  async checkSubscription() {
    return this.request<{ success: boolean; isPremium: boolean; planName: string; status: string; endDate?: string; expiresAt?: string }>('/subscriptions/check');
  }

  // Tier and feature usage endpoints
  async getTierInfo() {
    return this.request<{ success: boolean; tierId: string; planName: string; isPremium: boolean; features: string[] }>('/subscriptions/tier');
  }

  async checkFeatureLimit(featureId: string, limit: number) {
    return this.request<{ success: boolean; allowed: boolean; currentUsage: number; limit: number | 'unlimited' }>(
      `/subscriptions/feature/${featureId}/check?limit=${limit}`
    );
  }

  async useFeature(featureId: string) {
    return this.request<{ success: boolean; newCount: number }>(`/subscriptions/feature/${featureId}/use`, {
      method: 'POST',
    });
  }

  async getFeatureUsage() {
    return this.request<{ success: boolean; usage: Array<{ featureId: string; usageCount: number; periodStart: string; periodEnd: string }> }>('/subscriptions/usage');
  }

  // One-time purchases
  async getPurchases() {
    return this.request<{ success: boolean; purchases: Array<{
      id: number;
      productId: string;
      productName: string;
      price: number;
      currency: string;
      status: string;
      purchasedAt: string;
      expiresAt?: string;
    }> }>('/subscriptions/purchases');
  }

  async createPurchase(data: { productId: string; productName: string; price: number; currency?: string; metadata?: Record<string, unknown> }) {
    return this.request<{ success: boolean; purchase: unknown }>('/subscriptions/purchase', {
      method: 'POST',
      body: data,
    });
  }

  // White label configuration (Pro users only)
  async getWhiteLabelConfig() {
    return this.request<{
      success: boolean;
      config: {
        companyName: string;
        logoUrl: string;
        primaryColor: string;
        contactInfo: string;
        disclaimer: string;
        isActive: boolean;
      } | null;
    }>('/subscriptions/white-label');
  }

  async updateWhiteLabelConfig(data: {
    companyName?: string;
    logoUrl?: string;
    primaryColor?: string;
    contactInfo?: string;
    disclaimer?: string;
    isActive?: boolean;
  }) {
    return this.request<{
      success: boolean;
      config: {
        companyName: string;
        logoUrl: string;
        primaryColor: string;
        contactInfo: string;
        disclaimer: string;
        isActive: boolean;
      };
    }>('/subscriptions/white-label', {
      method: 'PUT',
      body: data,
    });
  }

  // Upgrade subscription
  async upgradeSubscription(data: { targetTierId: string; billingPeriod?: 'monthly' | 'yearly' }) {
    return this.request<{
      success: boolean;
      message: string;
      subscription: unknown;
      proratedCredit: string;
    }>('/subscriptions/upgrade', {
      method: 'POST',
      body: data,
    });
  }

  // Gamification endpoints
  async getGamificationStats() {
    return this.request<{ success: boolean; stats: unknown }>('/gamification/stats');
  }

  async getStreak() {
    try {
      const response = await this.getGamificationStats();
      const stats = response.stats as { currentStreak?: number } | null;
      return { success: true, streak: stats?.currentStreak || 0 };
    } catch {
      return { success: false, streak: 0 };
    }
  }

  async getAchievements() {
    return this.request<{ success: boolean; achievements: unknown[] }>('/gamification/achievements');
  }

  async getLeaderboard(period?: 'daily' | 'weekly' | 'monthly' | 'all_time') {
    const query = period ? `?period=${period}` : '';
    return this.request<{ success: boolean; leaderboard: unknown[] }>(`/gamification/leaderboard${query}`);
  }

  // Notifications endpoints
  async registerPushSubscription(subscription: PushSubscription) {
    return this.request<{ success: boolean }>('/notifications/subscribe', {
      method: 'POST',
      body: { subscription },
    });
  }

  async getNotificationPreferences() {
    return this.request<{ success: boolean; preferences: Record<string, boolean> }>('/notifications/preferences');
  }

  async updateNotificationPreferences(preferences: Record<string, boolean>) {
    return this.request<{ success: boolean }>('/notifications/preferences', {
      method: 'PUT',
      body: { preferences },
    });
  }

  // Friends endpoints
  async getFriends() {
    return this.request<{ success: boolean; friends: unknown[] }>('/friends');
  }

  async getFriendRequests() {
    return this.request<{ success: boolean; received: unknown[]; sent: unknown[] }>('/friends/requests');
  }

  async sendFriendRequest(email: string) {
    return this.request<{ success: boolean; request: unknown }>('/friends/request', {
      method: 'POST',
      body: { email },
    });
  }

  async acceptFriendRequest(requestId: number) {
    return this.request<{ success: boolean }>(`/friends/request/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async removeFriend(friendId: number) {
    return this.request<{ success: boolean }>(`/friends/${friendId}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request<{ totalUsers: number; activeUsers: number; premiumUsers: number; newUsersThisWeek: number }>('/admin/dashboard');
  }

  async getAdminUsers() {
    return this.request<{ users: Array<{ id: number; email: string; name: string; role: string; createdAt: string }> }>('/admin/users');
  }

  async updateAdminUser(userId: number, data: { role?: string }) {
    return this.request<{ user: unknown }>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async getAdminSettings() {
    return this.request<{ settings: unknown }>('/admin/settings');
  }

  async updateAdminSettings(settings: Record<string, unknown>) {
    return this.request<{ success: boolean; message: string }>('/admin/settings', {
      method: 'PUT',
      body: settings,
    });
  }

  async getAdminAnalytics() {
    return this.request<{ analytics: unknown }>('/admin/analytics');
  }

  async getAdminAgents() {
    return this.request<{ agents: Array<{ name: string; filename: string; description: string; content: string }>; count: number }>('/admin/agents');
  }

  async getAdminSkills() {
    return this.request<{ skills: Array<{ name: string; command: string; filename: string; description: string; content: string }>; count: number }>('/admin/skills');
  }

  async getAdminMCP() {
    return this.request<{ configured: boolean; config: unknown; message?: string }>('/admin/mcp');
  }

  async getAdminResearch() {
    return this.request<{ documents: Array<{ name: string; filename: string; summary: string; content: string; modifiedAt: string }>; count: number }>('/admin/research');
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;
