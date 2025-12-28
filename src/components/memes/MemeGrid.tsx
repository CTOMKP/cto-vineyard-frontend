'use client';

import { useMemes } from '@/hooks/useMemes';
import { MemeCard } from './MemeCard';
import { Spinner } from '@/components/ui/Spinner';
import { Search } from 'lucide-react';

interface MemeGridProps {
  searchTerm?: string;
}

export function MemeGrid({ searchTerm = '' }: MemeGridProps) {
  const { data: memes, isLoading, error, refetch } = useMemes();

  // Filter memes by search term
  const filteredMemes = memes?.filter((meme) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      meme.filename?.toLowerCase().includes(term) ||
      meme.originalName?.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" />
        <p className="text-white/50">Loading memes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <Search className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Failed to Load</h3>
        <p className="text-white/60 max-w-md mb-4">
          We couldn&apos;t load the memes. The server might be temporarily unavailable.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!filteredMemes?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-16 h-16 mb-4 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)',
          }}
        >
          <Search className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {searchTerm ? 'No Results Found' : 'No Memes Yet'}
        </h3>
        <p className="text-white/60 max-w-md">
          {searchTerm
            ? 'No memes match your search. Try a different term.'
            : 'No memes available yet. Check back later!'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredMemes.map((meme, index) => (
          <div key={meme.id} className="w-[300px] sm:w-[200px] lg:w-[250px]">
            <MemeCard meme={meme} priority={index < 12} />
          </div>
        ))}
      </div>
    </div>
  );
}

