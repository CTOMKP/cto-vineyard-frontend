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
    // This points to your NestJS backend - Production Railway URL
    const baseUrl = 'https://cto-backend-production-28e3.up.railway.app';
    
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

    const baseUrl = 'https://cto-backend-production-28e3.up.railway.app';

    // Step 1: Request presigned upload URL from unified backend meme endpoint
    const presignResponse = await fetch(`${baseUrl}/api/memes/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${extendedSession.accessToken}`,
      },
      body: JSON.stringify({
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

    const presignData = await presignResponse.json();
    const { uploadUrl, key, metadata, memeId } = presignData;
    if (!uploadUrl || !key) {
      throw new Error('Invalid presign response from server');
    }

    // Step 2: Upload directly to S3 using presigned URL
    console.log('Uploading to S3:', uploadUrl.substring(0, 100) + '...');
    console.log('S3 Key:', key);
    console.log('Full presigned URL bucket check:', uploadUrl.includes('ctom-bucket-backup') ? 'CORRECT BUCKET' : 'WRONG BUCKET - URL contains: ' + uploadUrl.match(/\.s3\.([^.]+)\.amazonaws\.com/)?.[1] || 'unknown');
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    console.log('S3 upload response status:', uploadResponse.status, uploadResponse.statusText);
    console.log('S3 upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('S3 upload failed:', errorText);
      throw new Error(`S3 upload failed with status ${uploadResponse.status}: ${errorText}`);
    }
    
    // Verify upload succeeded - try to access the file via CloudFront after a short delay
    console.log('S3 upload appears successful, verifying file exists...');
    
    // Wait a moment for S3 to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to verify file exists by checking CloudFront URL
    const { getCloudFrontUrl } = await import('../lib/image-url-helper');
    const verifyUrl = getCloudFrontUrl(key);
    console.log('Verifying file at:', verifyUrl);
    
    try {
      const verifyResponse = await fetch(verifyUrl, { method: 'HEAD' });
      console.log('File verification response:', verifyResponse.status, verifyResponse.statusText);
      if (verifyResponse.status === 404) {
        console.warn('⚠️ WARNING: File uploaded but not found at CloudFront URL - may be S3 propagation delay or wrong bucket');
      } else if (verifyResponse.ok) {
        console.log('✅ File verified and accessible via CloudFront');
      }
    } catch (verifyError) {
      console.warn('⚠️ Could not verify file (may be CORS or network issue):', verifyError);
    }

    // Step 3: Transform URL to CloudFront (backend may return presigned URLs)
    // The backend returns 'key' which is the S3 key, use that to build CloudFront URL
    const { getCloudFrontUrl } = await import('../lib/image-url-helper');
    
    // Build CloudFront URL from S3 key (key is the S3 path like 'user-uploads/10/meme/1762218709563_joker.jpg')
    const cloudfrontUrl = getCloudFrontUrl(key);
    
    // Use memeId (database ID) from backend, so it matches the ID format from getAllMemes
    // This ensures the uploaded image matches the format when we reload from backend
    const imageId = memeId || metadata?.id || key;
    
    const response = {
      id: imageId, // Use database ID (memeId) so it matches getAllMemes response format
      url: cloudfrontUrl, // Always use CloudFront URL
      originalName: metadata?.originalName || metadata?.filename || file.name,
      size: file.size,
      uploadDate: new Date().toISOString(),
      filename: metadata?.filename || file.name,
      mimeType: metadata?.mimeType || file.type,
    };
    
    console.log('Using memeId:', memeId, 'metadata.id:', metadata?.id, 'final imageId:', imageId);
    
    console.log('Upload response:', response);
    return response;
  }, [extendedSession]);

  const deleteImage = useCallback(async (imageId: string): Promise<ApiResponse> => {
    // Delete from meme endpoint in unified backend
    const baseUrl = 'https://cto-backend-production-28e3.up.railway.app';
    const response = await fetch(`${baseUrl}/api/memes/${imageId}`, {
      method: 'DELETE',
      headers: extendedSession?.accessToken ? {
        Authorization: `Bearer ${extendedSession.accessToken}`,
      } : {},
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.statusText}`);
    }
    
    return await response.json();
  }, [extendedSession]);

  const getImages = useCallback(async (): Promise<Image[]> => {
    const baseUrl = 'https://cto-backend-production-28e3.up.railway.app';
    const response = await fetch(`${baseUrl}/api/memes`, {
      headers: extendedSession?.accessToken ? {
        Authorization: `Bearer ${extendedSession.accessToken}`,
      } : {},
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }
    
    const data = await response.json();
    // Handle both direct array response and wrapped response
    return Array.isArray(data) ? data : (data.data || data);
  }, [extendedSession]);

  const downloadImage = useCallback(async (imageId: string): Promise<Blob> => {
    const baseUrl = 'https://cto-backend-production-28e3.up.railway.app';
    
    // URL encode the imageId to handle slashes
    const encodedId = encodeURIComponent(imageId);
    
    const response = await fetch(`${baseUrl}/api/memes/${encodedId}/download`, {
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
    return apiCall(`/memes/${imageId}`, {
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
