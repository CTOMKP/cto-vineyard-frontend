/**
 * CTO Vineyard v2 - Meme Hooks
 * TanStack Query hooks for meme operations
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getCloudFrontUrl } from '@/lib/cloudfront';
import type { Meme, PresignRequest } from '@/types';
import toast from 'react-hot-toast';

// Query Keys
export const memeKeys = {
  all: ['memes'] as const,
  detail: (id: string) => ['memes', id] as const,
};

/**
 * Hook to fetch all memes
 */
export function useMemes() {
  return useQuery({
    queryKey: memeKeys.all,
    queryFn: async () => {
      const memes = await api.getMemes();
      // Transform URLs to CloudFront
      return memes.map(meme => ({
        ...meme,
        url: getCloudFrontUrl(meme.url),
      }));
    },
    staleTime: 60_000,           // Fresh for 1 minute
    gcTime: 5 * 60_000,          // Keep in cache 5 minutes
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });
}

/**
 * Hook to fetch a single meme
 */
export function useMeme(id: string) {
  return useQuery({
    queryKey: memeKeys.detail(id),
    queryFn: async () => {
      const meme = await api.getMeme(id);
      return {
        ...meme,
        url: getCloudFrontUrl(meme.url),
      };
    },
    enabled: !!id,
  });
}

/**
 * Hook to delete a meme
 */
export function useDeleteMeme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.deleteMeme(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Optimistically remove from cache
      queryClient.setQueryData<Meme[]>(memeKeys.all, (old) =>
        old?.filter((meme) => meme.id !== deletedId)
      );
      toast.success('Image deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    },
  });
}

/**
 * Hook to update meme metadata
 */
export function useUpdateMeme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { filename?: string; description?: string; category?: string };
    }) => {
      return api.updateMeme(id, data);
    },
    onSuccess: (updatedMeme) => {
      // Update in cache
      queryClient.setQueryData<Meme[]>(memeKeys.all, (old) =>
        old?.map((meme) =>
          meme.id === updatedMeme.id ? { ...meme, ...updatedMeme } : meme
        )
      );
      toast.success('Image updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update');
    },
  });
}

/**
 * Hook to upload a meme
 */
export function useUploadMeme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image must be 10MB or less');
      }

      // Step 1: Get presigned URL from backend
      const presignData = await api.getPresignedUrl({
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      });

      if (!presignData.uploadUrl || !presignData.key) {
        throw new Error('Invalid presign response');
      }

      // Step 2: Upload directly to S3
      const uploadResponse = await fetch(presignData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      // Return the new meme data
      return {
        id: presignData.memeId,
        key: presignData.key,
        url: getCloudFrontUrl(presignData.key),
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        uploadDate: new Date().toISOString(),
      };
    },
    onSuccess: (newMeme) => {
      // Add to cache
      queryClient.setQueryData<Meme[]>(memeKeys.all, (old) => {
        const meme: Meme = {
          id: newMeme.id,
          url: newMeme.url,
          originalName: newMeme.originalName,
          filename: newMeme.originalName,
          size: newMeme.size,
          mimeType: newMeme.mimeType,
          uploadDate: newMeme.uploadDate,
        };
        return old ? [meme, ...old] : [meme];
      });
      toast.success('Image uploaded successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    },
  });
}

