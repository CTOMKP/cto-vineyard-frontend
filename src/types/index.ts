// ===========================================
// CTO Vineyard v2 - Type Definitions
// ===========================================

// Meme/Image types
export interface Meme {
  id: string;
  url: string;
  originalName: string;
  filename?: string;
  size: number;
  mimeType?: string;
  uploadDate: string;
  description?: string;
  category?: string;
  path?: string;
}

export interface PresignRequest {
  filename: string;
  mimeType: string;
  size: number;
}

export interface PresignResponse {
  uploadUrl: string;
  key: string;
  memeId: string;
  metadata?: {
    id?: string;
    filename?: string;
    originalName?: string;
    mimeType?: string;
  };
}

// Auth types
export interface User {
  id: string;
  email: string;
}

export interface ExtendedSession {
  user: User;
  accessToken?: string;
  error?: string;
}

// Admin types
export interface AdminStats {
  users: { total: number };
  listings: {
    total: number;
    pending: number;
    published: number;
    rejected: number;
  };
  payments: {
    total: number;
    completed: number;
    pending: number;
    revenue: number;
    currency: string;
  };
  adBoosts: { active: number };
}

export interface Listing {
  id: string;
  title: string;
  description?: string;
  contractAddr: string;
  status: 'pending' | 'published' | 'rejected' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
  };
}

export interface AdminWallet {
  id: string;
  address?: string | null;
  blockchain: string;
  walletClient?: string | null;
  isPrimary: boolean;
  createdAt: string;
  walletBalances: AdminWalletBalance[];
  walletTransactions: AdminWalletTransaction[];
}

export interface AdminWalletBalance {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName?: string | null;
  decimals: number;
  balance: string;
  balanceUsd?: number | null;
  lastUpdated: string;
}

export interface AdminWalletTransaction {
  txHash: string;
  txType: string;
  amount: string;
  tokenSymbol: string;
  fromAddress?: string | null;
  toAddress?: string | null;
  status: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name?: string | null;
  role?: string;
  privyDid?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  wallets: AdminWallet[];
  _count?: {
    wallets: number;
    userListings: number;
    payments: number;
    scanResults: number;
  };
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  listing?: {
    id: string;
    title: string;
  };
  user?: {
    email: string;
  };
}

export interface AdBoost {
  id: string;
  listingId: string;
  type: 'top' | 'priority' | 'bump' | 'spotlight' | 'homepage' | 'urgent';
  durationDays: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    contractAddr: string;
    user: {
      email: string;
    };
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

