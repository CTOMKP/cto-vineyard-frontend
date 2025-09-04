"use client";

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white/20">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 bg-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
            style={{
                background: 'linear-gradient(100.86deg, rgba(255, 0, 117, 0.8) 4.13%, rgba(255, 74, 21, 0.8) 55.91%, rgba(255, 203, 69, 0.8) 100%)'
              }}
          >
            <Home size={20} />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
