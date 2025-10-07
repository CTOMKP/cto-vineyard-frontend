import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

interface ApiCallOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface Image {
  id: string;
  url: string;
  originalName: string;
  size: number;
  uploadDate: string;
  filename?: string;
  mimeType?: string;
  path?: string;
  description?: string;
  category?: string;
}

interface ExtendedSession {
  user: {
    id: string;
    email: string;
  };
  accessToken?: string;
  error?: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

interface UploadResponse {
  id: string;
  url: string;
  originalName: string;
  size: number;
  uploadDate: string;
}

export const useApi = () => {
  const { data: session } = useSession();
  const extendedSession = session as ExtendedSession | null;

  const apiCall = useCallback(async (endpoint: string, options: ApiCallOptions = {}): Promise<ApiResponse> => {
    // This points to your NestJS backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (extendedSession?.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${extendedSession.accessToken}`,
      };
    }

    try {
      const response = await fetch(`${baseUrl}/api${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }, [extendedSession]);

  const uploadImage = useCallback(async (file: File): Promise<UploadResponse> => {
    if (!extendedSession?.accessToken) {
      throw new Error('Authentication required');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image must be 10MB or less');
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Step 1: Request presigned upload URL from backend
    const presignResponse = await fetch(`${baseUrl}/api/images/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${extendedSession.accessToken}`,
      },
      body: JSON.stringify({
        type: 'meme',
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      }),
    });

    if (!presignResponse.ok) {
      const errorText = await presignResponse.text();
      console.error('Presign failed:', presignResponse.status, errorText);
      throw new Error(`Failed to get upload URL: ${presignResponse.status}`);
    }

    const { uploadUrl, key, metadata } = await presignResponse.json();
    if (!uploadUrl || !key) {
      throw new Error('Invalid presign response from server');
    }

    // Step 2: Upload directly to S3 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed with status ${uploadResponse.status}`);
    }

    // Step 3: Return metadata with view URL
    const viewUrl = `${baseUrl}/api/images/view/${key}`;
    return {
      id: key,
      url: viewUrl,
      originalName: key,
      size: file.size,
      uploadDate: new Date().toISOString(),
      ...metadata,
    };
  }, [extendedSession]);

  const deleteImage = useCallback(async (imageId: string): Promise<ApiResponse> => {
    return apiCall(`/images/${imageId}`, { method: 'DELETE' });
  }, [apiCall]);

  const getImages = useCallback(async (): Promise<Image[]> => {
    const response = await apiCall('/images');
    
    // Backend returns direct array, so return it directly
    if (Array.isArray(response)) {
      return response as Image[];
    }
    
    // Fallback for wrapped response format
    return (response.data || response) as Image[];
  }, [apiCall]);

  const downloadImage = useCallback(async (imageId: string): Promise<Blob> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${baseUrl}/api/images/${imageId}/download`, {
      headers: {
        Authorization: `Bearer ${extendedSession?.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  }, [extendedSession]);

  const editImage = useCallback(async (imageId: string, data: { fileName?: string; description?: string; category?: string }): Promise<ApiResponse> => {
    // Transform fileName to filename for the API
    const apiData = {
      filename: data.fileName,
      description: data.description,
      category: data.category
    };
    return apiCall(`/images/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });
  }, [apiCall]);

  return {
    apiCall,
    uploadImage,
    deleteImage,
    getImages,
    downloadImage,
    editImage,
    isAuthenticated: !!extendedSession?.accessToken,
  };
};