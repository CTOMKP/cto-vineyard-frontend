/**
 * CTO Vineyard v2 - API Client
 * Single source of truth for all backend communication
 */

import type { 
  Meme, 
  PresignRequest, 
  PresignResponse, 
  AdminStats, 
  Listing, 
  Payment, 
  AdBoost 
} from '@/types';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Set the auth token for authenticated requests
   */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * Get the current token
   */
  getToken() {
    return this.token;
  }

  /**
   * Base request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Access denied');
      }
      if (response.status === 404) {
        throw new Error('Not found');
      }
      
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // ===========================
  // Meme Endpoints
  // ===========================

  /**
   * Get all memes (public)
   */
  async getMemes(): Promise<Meme[]> {
    const data = await this.request<Meme[] | { data: Meme[] }>('/api/v1/memes');
    return Array.isArray(data) ? data : (data.data || []);
  }

  /**
   * Get single meme by ID
   */
  async getMeme(id: string): Promise<Meme> {
    return this.request<Meme>(`/api/v1/memes/${id}`);
  }

  /**
   * Delete a meme (requires auth)
   */
  async deleteMeme(id: string): Promise<void> {
    await this.request(`/api/v1/memes/${id}`, { method: 'DELETE' });
  }

  /**
   * Update meme metadata (requires auth)
   */
  async updateMeme(
    id: string, 
    data: { filename?: string; description?: string; category?: string }
  ): Promise<Meme> {
    return this.request<Meme>(`/api/v1/memes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get presigned URL for S3 upload (requires auth)
   */
  async getPresignedUrl(data: PresignRequest): Promise<PresignResponse> {
    return this.request<PresignResponse>('/api/v1/memes/presign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===========================
  // Auth Endpoints
  // ===========================

  /**
   * Login with email/password
   */
  async login(email: string, password: string) {
    return this.request<{
      user: { id: string; email: string };
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    return this.request<{
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    }>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // ===========================
  // Admin Endpoints
  // ===========================

  /**
   * Get admin dashboard stats
   */
  async getAdminStats(): Promise<AdminStats> {
    const data = await this.request<{ stats: AdminStats }>('/api/v1/admin/dashboard/stats');
    return data.stats;
  }

  /**
   * Get pending listings
   */
  async getPendingListings(): Promise<Listing[]> {
    const data = await this.request<{ listings: Listing[] }>('/api/v1/admin/listings/pending');
    return data.listings || [];
  }

  /**
   * Approve a listing
   */
  async approveListing(id: string): Promise<void> {
    await this.request(`/api/v1/admin/listings/${id}/approve`, { method: 'POST' });
  }

  /**
   * Reject a listing
   */
  async rejectListing(id: string, reason?: string): Promise<void> {
    await this.request(`/api/v1/admin/listings/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Get payments with optional filters
   */
  async getPayments(filters?: { status?: string; limit?: number }): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.limit) params.set('limit', String(filters.limit));
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{ payments: Payment[] }>(`/api/v1/admin/payments${query}`);
    return data.payments || [];
  }

  /**
   * Get active ad boosts
   */
  async getActiveBoosts(): Promise<AdBoost[]> {
    const data = await this.request<{ boosts: AdBoost[] }>('/api/v1/admin/ad-boosts/active');
    return data.boosts || [];
  }
}

// Singleton instance
export const api = new ApiClient();

