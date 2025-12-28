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
 * Hook to approve a listing
 */
export function useApproveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.approveListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listings });
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
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.rejectListing(id, reason),
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

