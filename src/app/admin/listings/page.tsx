"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MoonLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { ChevronLeft, Check, X, FileText } from 'lucide-react';

interface PendingListing {
  id: string;
  title: string;
  contractAddr: string;
  chain: string;
  description: string;
  vettingTier: string;
  vettingScore: number;
  status: string;
  user: {
    id: number;
    email: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminListings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';
  const adminUserId = ((session as unknown as Record<string, unknown>)?.user as Record<string, unknown>)?.email || '';

  const loadPendingListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/admin/listings/pending`, {
        headers: {
          Authorization: `Bearer ${(session as unknown as Record<string, unknown>)?.accessToken || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load pending listings');
      }

      const data = await response.json();
      setPendingListings(data.listings || []);
    } catch (error) {
      console.error('Failed to load pending listings:', error);
      toast.error('Failed to load pending listings');
    } finally {
      setLoading(false);
    }
  }, [session, baseUrl]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadPendingListings();
    }
  }, [status, router, loadPendingListings]);

  const handleApprove = async (listingId: string) => {
    if (!confirm('Are you sure you want to approve this listing?')) return;

    setProcessingId(listingId);
    try {
      const response = await fetch(`${baseUrl}/api/admin/listings/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as unknown as Record<string, unknown>)?.accessToken || ''}`,
        },
        body: JSON.stringify({
          listingId,
          adminUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve listing');
      }

      toast.success('Listing approved successfully!');
      loadPendingListings(); // Refresh list
    } catch (error) {
      console.error('Failed to approve listing:', error);
      toast.error('Failed to approve listing');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (listingId: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    setProcessingId(listingId);
    try {
      const response = await fetch(`${baseUrl}/api/admin/listings/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as unknown as Record<string, unknown>)?.accessToken || ''}`,
        },
        body: JSON.stringify({
          listingId,
          adminUserId,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject listing');
      }

      toast.success('Listing rejected');
      loadPendingListings(); // Refresh list
    } catch (error) {
      console.error('Failed to reject listing:', error);
      toast.error('Failed to reject listing');
    } finally {
      setProcessingId(null);
    }
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
                Pending Listings
              </h1>
              <p className="text-white/60 text-sm">Review and approve user listings</p>
            </div>
          </div>
          <button
            onClick={loadPendingListings}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Pending Listings */}
        {pendingListings.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <h3 className="text-xl font-semibold mb-2">No Pending Listings</h3>
            <p className="text-white/60">All listings have been reviewed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 hover:border-yellow-500/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white">{listing.title}</h3>
                      <span className="bg-yellow-500/20 text-yellow-500 text-xs px-3 py-1 rounded-full">
                        ⏳ {listing.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p className="text-white/80">
                        <span className="text-white/60">Contract:</span>{' '}
                        <code className="bg-[#262626] px-2 py-1 rounded text-xs">{listing.contractAddr}</code>
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Chain:</span> {listing.chain}
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Vetting:</span>{' '}
                        <span className="font-semibold">{listing.vettingTier}</span> ({listing.vettingScore}/100)
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Submitted by:</span> {listing.user?.email || 'Unknown'}
                      </p>
                      <p className="text-white/80">
                        <span className="text-white/60">Submitted:</span>{' '}
                        {new Date(listing.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-4 p-4 bg-[#262626] rounded-lg">
                      <p className="text-xs text-white/60 mb-1">Description:</p>
                      <p className="text-sm text-white/90 whitespace-pre-wrap">{listing.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleApprove(listing.id)}
                      disabled={processingId === listing.id}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {processingId === listing.id ? (
                        <MoonLoader size={16} color="#ffffff" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(listing.id)}
                      disabled={processingId === listing.id}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {processingId === listing.id ? (
                        <MoonLoader size={16} color="#ffffff" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                      Reject
                    </button>
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

