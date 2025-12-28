'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download } from 'lucide-react';
import type { Meme } from '@/types';
import { Spinner } from '@/components/ui/Spinner';

interface MemeCardProps {
  meme: Meme;
  priority?: boolean;
}

export function MemeCard({ meme, priority = false }: MemeCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Get download URL from backend
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const downloadUrl = `${baseUrl}/api/v1/memes/${encodeURIComponent(meme.id)}/download`;
      
      // Trigger download
      window.location.href = downloadUrl;
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  if (imageError) {
    return null; // Hide card if image fails to load
  }

  return (
    <div className="relative group w-full aspect-square">
      <Image
        src={meme.url}
        alt={meme.filename || meme.originalName}
        fill
        unoptimized
        className="object-cover border border-[#262626] rounded-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority={priority}
        onError={() => setImageError(true)}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 rounded-lg flex flex-col justify-between p-3">
        {/* Download Button */}
        <div className="flex justify-end">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-8 h-8 bg-white/90 hover:bg-white text-black rounded-full transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
            title={downloading ? 'Downloading...' : 'Download image'}
          >
            {downloading ? (
              <Spinner size="sm" color="#000000" />
            ) : (
              <Download size={16} />
            )}
          </button>
        </div>

        {/* Filename */}
        <div className="bg-black/70 rounded-lg px-2 py-1">
          <span className="text-white text-sm font-medium truncate block">
            {meme.filename || meme.originalName}
          </span>
        </div>
      </div>
    </div>
  );
}

