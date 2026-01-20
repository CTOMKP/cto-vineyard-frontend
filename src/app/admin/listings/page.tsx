'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, FileText, CheckCircle, XCircle, BadgeCheck, Clock, Ban } from 'lucide-react';
import { usePendingListings, usePublishedListings, useRejectedListings, useApproveListing, useRejectListing } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getCloudFrontUrl } from '@/lib/cloudfront';
import type { ExtendedSession } from '@/lib/auth';

const tabs = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'published', label: 'Approved', icon: BadgeCheck },
  { id: 'rejected', label: 'Rejected', icon: Ban },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function AdminListingsPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as ExtendedSession | null)?.accessToken;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('pending');
  const isAuthed = status === 'authenticated' && Boolean(accessToken);
  const { data: pending, isLoading: pendingLoading, refetch: refetchPending } = usePendingListings({ enabled: isAuthed });
  const { data: published, isLoading: publishedLoading, refetch: refetchPublished } = usePublishedListings({ enabled: isAuthed });
  const { data: rejected, isLoading: rejectedLoading, refetch: refetchRejected } = useRejectedListings({ enabled: isAuthed });
  const approveMutation = useApproveListing();
  const rejectMutation = useRejectListing();

  const adminUserId = session?.user?.email || '';
  const visibleListings = activeTab === 'published' ? (published || [])
    : activeTab === 'rejected' ? (rejected || [])
    : (pending || []);

  const isLoading = pendingLoading || publishedLoading || rejectedLoading || status === 'loading';

  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-[240px] flex items-center justify-center">
        <Spinner size="lg" color="#FF0075" />
      </div>
    );
  }

  const handleApprove = async (id: string) => {
    await approveMutation.mutateAsync({ listingId: id, adminUserId });
    await refetchPending();
    await refetchPublished();
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason (required):') || '';
    if (!reason.trim()) return;
    await rejectMutation.mutateAsync({ listingId: id, reason, adminUserId });
    await refetchPending();
    await refetchRejected();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Listings</p>
            <h1 className="text-2xl font-bold">User Listings Review</h1>
            <p className="text-white/60 text-sm">Approve, reject, or monitor submissions.</p>
          </div>
        </div>
        <Button onClick={() => { refetchPending(); refetchPublished(); refetchRejected(); }} variant="secondary">
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {!visibleListings?.length ? (
        <Card className="p-10 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-semibold mb-2">Nothing to review</h3>
          <p className="text-white/60">No listings match this status right now.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleListings.map((listing) => (
            <Card key={listing.id} className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{listing.title}</h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                      {listing.status}
                    </span>
                  </div>
                  {listing.description && (
                    <p className="text-white/80">{listing.description}</p>
                  )}
                  {listing.bio && (
                    <p className="text-white/60 text-sm">{listing.bio}</p>
                  )}
                  <div className="grid gap-2 text-sm text-white/60">
                    <div>
                      <span className="font-medium text-white/70">Contract:</span>{' '}
                      <code className="bg-[#262626] px-2 py-1 rounded text-xs break-all">
                        {listing.contractAddr}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium text-white/70">Submitted by:</span> {listing.user?.email}
                    </div>
                    <div>
                      <span className="font-medium text-white/70">Date:</span>{' '}
                      {new Date(listing.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {(listing.logoUrl || listing.bannerUrl) && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {listing.logoUrl && (
                        <div className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Logo</p>
                          <img
                            src={getCloudFrontUrl(listing.logoUrl)}
                            alt={`${listing.title} logo`}
                            className="h-24 w-24 rounded-lg object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      {listing.bannerUrl && (
                        <div className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Banner</p>
                          <img
                            src={getCloudFrontUrl(listing.bannerUrl)}
                            alt={`${listing.title} banner`}
                            className="h-24 w-full rounded-lg object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {listing.links && Object.keys(listing.links).length > 0 && (
                    <div className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Links</p>
                      <div className="grid gap-2 text-sm text-white/70">
                        {Object.entries(listing.links).map(([label, url]) => (
                          <a
                            key={label}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-white break-all"
                          >
                            {label}: {url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {activeTab === 'pending' && (
                  <div className="flex flex-row gap-2">
                    <Button
                      onClick={() => handleApprove(listing.id)}
                      loading={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(listing.id)}
                      loading={rejectMutation.isPending}
                      variant="danger"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                {activeTab === 'published' && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <BadgeCheck className="w-4 h-4" />
                    Approved
                  </div>
                )}

                {activeTab === 'rejected' && (
                  <div className="flex items-center gap-2 text-rose-400 text-sm">
                    <Ban className="w-4 h-4" />
                    Rejected
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
