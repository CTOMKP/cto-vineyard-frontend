/**
 * CTO Vineyard v2 - Admin Hooks
 * TanStack Query hooks for admin operations
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// Query Keys
export const adminKeys = {
  stats: ['admin', 'stats'] as const,
  listings: ['admin', 'listings'] as const,
  publishedListings: ['admin', 'listings', 'published'] as const,
  rejectedListings: ['admin', 'listings', 'rejected'] as const,
  marketplaceAds: ['admin', 'marketplace-ads'] as const,
  publishedMarketplaceAds: ['admin', 'marketplace-ads', 'published'] as const,
  rejectedMarketplaceAds: ['admin', 'marketplace-ads', 'rejected'] as const,
  users: ['admin', 'users'] as const,
  payments: ['admin', 'payments'] as const,
  boosts: ['admin', 'boosts'] as const,
  escrows: ['admin', 'escrows'] as const,
};

/**
 * Hook to fetch admin dashboard stats
 */
export function useAdminStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => api.getAdminStats(),
    staleTime: 30_000, // Fresh for 30 seconds
    retry: 2,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch pending listings
 */
export function usePendingListings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.listings,
    queryFn: () => api.getPendingListings(),
    staleTime: 30_000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch published listings
 */
export function usePublishedListings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.publishedListings,
    queryFn: () => api.getPublishedListings(),
    staleTime: 30_000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch rejected listings
 */
export function useRejectedListings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.rejectedListings,
    queryFn: () => api.getRejectedListings(),
    staleTime: 30_000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch pending marketplace ads
 */
export function usePendingMarketplaceAds(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.marketplaceAds,
    queryFn: () => api.getPendingMarketplaceAds(),
    staleTime: 30_000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch published marketplace ads
 */
export function usePublishedMarketplaceAds(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.publishedMarketplaceAds,
    queryFn: () => api.getPublishedMarketplaceAds(),
    staleTime: 30_000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch rejected marketplace ads
 */
export function useRejectedMarketplaceAds(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.rejectedMarketplaceAds,
    queryFn: () => api.getRejectedMarketplaceAds(),
    staleTime: 30_000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to fetch admin users
 */
export function useAdminUsers(filters?: { search?: string; limit?: number; offset?: number }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...adminKeys.users, filters],
    queryFn: () => api.getUsers(filters),
    staleTime: 30_000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to approve a listing
 */
export function useApproveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { listingId: string; adminUserId: string }) =>
      api.approveListing(payload.listingId, payload.adminUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listings });
      queryClient.invalidateQueries({ queryKey: adminKeys.publishedListings });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
      toast.success('Listing approved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to approve');
    },
  });
}

/**
 * Hook to reject a listing
 */
export function useRejectListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, reason, adminUserId }: { listingId: string; reason: string; adminUserId: string }) =>
      api.rejectListing(listingId, adminUserId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listings });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
      toast.success('Listing rejected');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reject');
    },
  });
}

/**
 * Hook to fetch payments
 */
export function usePayments(filters?: { status?: string; limit?: number }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...adminKeys.payments, filters],
    queryFn: () => api.getPayments(filters),
    staleTime: 30_000,
    enabled: options?.enabled,
  });
}

/**
 * Hook to approve a marketplace ad
 */
export function useApproveMarketplaceAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { adId: string; adminUserId: string }) =>
      api.approveMarketplaceAd(payload.adId, payload.adminUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.marketplaceAds });
      queryClient.invalidateQueries({ queryKey: adminKeys.publishedMarketplaceAds });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
      toast.success('Marketplace ad approved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to approve marketplace ad');
    },
  });
}

/**
 * Hook to reject a marketplace ad
 */
export function useRejectMarketplaceAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adId, reason, notes, adminUserId }: { adId: string; reason: string; notes?: string; adminUserId: string }) =>
      api.rejectMarketplaceAd(adId, adminUserId, reason, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.marketplaceAds });
      queryClient.invalidateQueries({ queryKey: adminKeys.rejectedMarketplaceAds });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
      toast.success('Marketplace ad rejected');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reject marketplace ad');
    },
  });
}

/**
 * Hook to fetch active ad boosts
 */
export function useActiveBoosts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKeys.boosts,
    queryFn: () => api.getActiveBoosts(),
    staleTime: 30_000,
    enabled: options?.enabled,
  });
}

export function useEscrows(status?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...adminKeys.escrows, status],
    queryFn: () => api.getEscrows(status),
    staleTime: 30_000,
    enabled: options?.enabled,
  });
}

export function useForceReleaseEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { escrowId: string; adminUserId: string }) =>
      api.forceReleaseEscrow(payload.escrowId, payload.adminUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.escrows });
      toast.success('Escrow released');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to release escrow');
    },
  });
}

export function useForceRefundEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { escrowId: string; adminUserId: string }) =>
      api.forceRefundEscrow(payload.escrowId, payload.adminUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.escrows });
      toast.success('Escrow refunded');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to refund escrow');
    },
  });
}

export function useExtendEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { escrowId: string; adminUserId: string; newDeadline: string }) =>
      api.extendEscrow(payload.escrowId, payload.adminUserId, payload.newDeadline),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.escrows });
      toast.success('Escrow deadline extended');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to extend escrow');
    },
  });
}

export function useFreezeEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { escrowId: string; adminUserId: string }) =>
      api.freezeEscrow(payload.escrowId, payload.adminUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.escrows });
      toast.success('Escrow frozen');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to freeze escrow');
    },
  });
}

export function useFlagEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { escrowId: string; adminUserId: string; reason?: string }) =>
      api.flagEscrow(payload.escrowId, payload.adminUserId, payload.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.escrows });
      toast.success('Escrow flagged');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to flag escrow');
    },
  });
}

export function useResolveEscrowDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { escrowId: string; adminUserId: string }) =>
      api.resolveEscrowDispute(payload.escrowId, payload.adminUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.escrows });
      toast.success('Dispute resolved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to resolve dispute');
    },
  });
}

