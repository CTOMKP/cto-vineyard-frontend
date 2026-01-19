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
  users: ['admin', 'users'] as const,
  payments: ['admin', 'payments'] as const,
  boosts: ['admin', 'boosts'] as const,
};

/**
 * Hook to fetch admin dashboard stats
 */
export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => api.getAdminStats(),
    staleTime: 30_000, // Fresh for 30 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch pending listings
 */
export function usePendingListings() {
  return useQuery({
    queryKey: adminKeys.listings,
    queryFn: () => api.getPendingListings(),
    staleTime: 30_000,
  });
}

/**
 * Hook to fetch published listings
 */
export function usePublishedListings() {
  return useQuery({
    queryKey: adminKeys.publishedListings,
    queryFn: () => api.getPublishedListings(),
    staleTime: 30_000,
  });
}

/**
 * Hook to fetch rejected listings
 */
export function useRejectedListings() {
  return useQuery({
    queryKey: adminKeys.rejectedListings,
    queryFn: () => api.getRejectedListings(),
    staleTime: 30_000,
  });
}

/**
 * Hook to fetch admin users
 */
export function useAdminUsers(filters?: { search?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...adminKeys.users, filters],
    queryFn: () => api.getUsers(filters),
    staleTime: 30_000,
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
export function usePayments(filters?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: [...adminKeys.payments, filters],
    queryFn: () => api.getPayments(filters),
    staleTime: 30_000,
  });
}

/**
 * Hook to fetch active ad boosts
 */
export function useActiveBoosts() {
  return useQuery({
    queryKey: adminKeys.boosts,
    queryFn: () => api.getActiveBoosts(),
    staleTime: 30_000,
  });
}

