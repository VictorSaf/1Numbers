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

  /**
   * Am uitat parola.
   *
   * Serverul întoarce mereu succes, chiar dacă adresa n-are cont -- altfel ruta
   * ar spune cine e înscris. Interfața trebuie să arate același lucru, deci nu
   * are ce eroare să trateze.
   */
  async forgotPassword(email: string, language: string) {
    return this.request<{ success: boolean }>('/auth/forgot', {
      method: 'POST',
      body: { email, language },
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ success: boolean }>('/auth/reset', {
      method: 'POST',
      body: { token, password },
    });
  }

  async verifyEmail(token: string) {
    return this.request<{ success: boolean }>('/auth/verify-email', {
      method: 'POST',
      body: { token },
    });
  }

  /** Cere ștergerea contului. Nu șterge -- trimite confirmarea pe email. */
  async requestAccountDeletion(language: string) {
    return this.request<{ success: boolean }>('/account/deletion-request', {
      method: 'POST',
      body: { language },
    });
  }

  /** Șterge, pe baza jetonului din email. */
  async confirmAccountDeletion(token: string) {
    return this.request<{ success: boolean }>('/account/delete', {
      method: 'POST',
      body: { token },
    });
  }

  /**
   * Descarcă tot ce ținem despre om.
   *
   * Nu trece prin `request`: acela citește JSON și îl întoarce ca obiect, iar
   * aici vrem FIȘIERUL. Portabilitatea înseamnă ceva ce poți lua cu tine, nu
   * ceva ce se afișează.
   */
  async exportMyData(): Promise<Blob> {
    const res = await fetch(`${this.baseUrl}/account/export`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    if (!res.ok) throw new Error(String(res.status));
    return res.blob();
  }

  /** Ce a acordat omul. Un fel lipsă înseamnă „nu l-am întrebat niciodată”. */
  async getConsents() {
    return this.request<{ consents: Record<string, boolean>; policyVersion: string }>('/account/consents');
  }

  async setConsent(kind: 'model' | 'notifications', granted: boolean) {
    return this.request<{ success: boolean; consents: Record<string, boolean> }>('/account/consents', {
      method: 'POST',
      body: { kind, granted },
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
    composed: { ziua: string; fric?: string; aproape?: string; intrebare: string };
  }) {
    return this.request<{
      body: { ziua: string; fric?: string; aproape?: string; intrebare: string };
      source: 'model' | 'composed';
      model?: string;
      /** Ce a scris omul ultima dată la aceeași cifră, citat întocmai. */
      echo?: string;
      cached: boolean;
    }>('/today/reading', { method: 'POST', body: data });
  }

  /**
   * Citirea întreagă a hărții: legată, nu enumerată.
   *
   * Propozițiile adevărate pleacă de aici, din `buildThread` -- aceleași care
   * compun firul. Serverul le dă modelului doar ca să le lege, și verifică la
   * întoarcere că n-a apărut nicio cifră străină de hartă.
   */
  async getDeepReading(data: {
    language: 'ro' | 'en' | 'ru';
    steps: Array<{ name: string; figures: string; say: string }>;
  }) {
    return this.request<{
      body: { opening: string; chapters: Array<{ title: string; text: string }>; closing: string };
      source: 'model' | 'composed';
      model?: string;
      cached: boolean;
    }>('/chart/reading', { method: 'POST', body: data });
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
  async createSubscription(data: { planId: number; billingPeriod?: 'monthly' | 'yearly' }) {
    return this.request<{ success: boolean; subscription: unknown }>('/subscriptions/create', {
      method: 'POST',
      body: data,
    });
  }

  async checkSubscription() {
    return this.request<{ success: boolean; isPremium: boolean; planName: string; status: string; endDate?: string; expiresAt?: string }>('/subscriptions/check');
  }

  // Tier and feature usage endpoints
  async getTierInfo() {
    return this.request<{ success: boolean; tierId: string; planName: string; isPremium: boolean; features: string[] }>('/subscriptions/tier');
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

  // Admin endpoints
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
