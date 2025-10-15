"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MoonLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { ChevronLeft, Zap } from 'lucide-react';

interface AdBoost {
  id: string;
  listingId: string;
  type: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    contractAddr: string;
    user: {
      email: string;
    };
  };
}

export default function AdminBoosts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [boosts, setBoosts] = useState<AdBoost[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = 'https://cto-backend-production-28e3.up.railway.app';

  const loadBoosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/admin/ad-boosts/active`, {
        headers: {
          Authorization: `Bearer ${(session as unknown as Record<string, unknown>)?.accessToken || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load ad boosts');
      }

      const data = await response.json();
      setBoosts(data.boosts || []);
    } catch (error) {
      console.error('Failed to load ad boosts:', error);
      toast.error('Failed to load ad boosts');
    } finally {
      setLoading(false);
    }
  }, [session, baseUrl]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadBoosts();
    }
  }, [status, router, loadBoosts]);

  const getBoostTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      top: 'bg-red-500/20 text-red-500',
      priority: 'bg-orange-500/20 text-orange-500',
      bump: 'bg-yellow-500/20 text-yellow-500',
      spotlight: 'bg-purple-500/20 text-purple-500',
      homepage: 'bg-pink-500/20 text-pink-500',
      urgent: 'bg-blue-500/20 text-blue-500',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-500';
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <MoonLoader size={40} color="#FF0075" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold"
                  style={{
                    background: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                🚀 Active Ad Boosts
              </h1>
              <p className="text-white/60 text-sm">Monitor active listing promotions</p>
            </div>
          </div>
          <button
            onClick={loadBoosts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Active Boosts */}
        {boosts.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-12 text-center">
            <Zap className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <h3 className="text-xl font-semibold mb-2">No Active Boosts</h3>
            <p className="text-white/60">No listings are currently boosted</p>
          </div>
        ) : (
          <div className="space-y-4">
            {boosts.map((boost) => (
              <div
                key={boost.id}
                className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 hover:border-orange-500/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white">
                        {boost.listing?.title || 'Unknown Listing'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBoostTypeColor(boost.type)}`}>
                        {boost.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p className="text-white/80">
                        <span className="text-white/60">Contract:</span>{' '}
                        <code className="bg-[#262626] px-2 py-1 rounded text-xs">
                          {boost.listing?.contractAddr || 'N/A'}
                        </code>
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Owner:</span> {boost.listing?.user?.email || 'Unknown'}
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Duration:</span> {boost.durationDays} days
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Started:</span>{' '}
                        {new Date(boost.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Ends:</span>{' '}
                        {new Date(boost.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Days Remaining:</span>{' '}
                        <span className="font-bold text-orange-500">{getDaysRemaining(boost.endDate)} days</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg text-sm font-semibold">
                      ✅ Active
                    </span>
                    {getDaysRemaining(boost.endDate) <= 2 && (
                      <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded text-xs">
                        ⏰ Expiring Soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

