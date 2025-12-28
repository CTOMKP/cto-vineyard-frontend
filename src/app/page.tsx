'use client';

import { useState } from 'react';
import { MemeGrid } from '@/components/memes/MemeGrid';
import { MemeSearch } from '@/components/memes/MemeSearch';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-10 md:px-[100px] pb-0 mb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-5 items-center justify-between mb-12">
        <h1 className="font-bold text-[32px]">CTO Marketplace memes</h1>
        <MemeSearch value={searchTerm} onChange={setSearchTerm} />
      </div>

      {/* Meme Grid */}
      <MemeGrid searchTerm={searchTerm} />
    </div>
  );
}

