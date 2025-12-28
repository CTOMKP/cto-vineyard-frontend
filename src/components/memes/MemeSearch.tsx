'use client';

import { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

interface MemeSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MemeSearch({ value, onChange }: MemeSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex items-center relative">
      <Search
        className="absolute left-3 text-white/50"
        size={16}
      />
      <input
        ref={inputRef}
        type="text"
        placeholder="search memes"
        className="w-full md:w-[371px] pl-10 pr-16 rounded-lg border border-white/20 h-[51px] placeholder:text-white/50 bg-transparent text-white focus:outline-none focus:border-white/40 transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="absolute right-3 rounded bg-white/5 text-white/50 text-xs py-1.5 px-2">
        Ctrl K
      </span>
    </div>
  );
}

