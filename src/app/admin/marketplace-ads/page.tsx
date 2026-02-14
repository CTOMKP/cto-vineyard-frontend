'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  BadgeCheck,
  Clock,
  Ban,
  CheckCircle,
  XCircle,
  FileText,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  usePendingMarketplaceAds,
  usePublishedMarketplaceAds,
  useRejectedMarketplaceAds,
  useApproveMarketplaceAd,
  useRejectMarketplaceAd,
} from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ExtendedSession } from '@/lib/auth';
import { getCloudFrontUrl } from '@/lib/cloudfront';

const tabs = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'published', label: 'Approved', icon: BadgeCheck },
  { id: 'rejected', label: 'Rejected', icon: Ban },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function AdminMarketplaceAdsPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as ExtendedSession | null)?.accessToken;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isAuthed = status === 'authenticated' && Boolean(accessToken);

  const { data: pending, isLoading: pendingLoading, refetch: refetchPending } = usePendingMarketplaceAds({ enabled: isAuthed });
  const { data: published, isLoading: publishedLoading, refetch: refetchPublished } = usePublishedMarketplaceAds({ enabled: isAuthed });
  const { data: rejected, isLoading: rejectedLoading, refetch: refetchRejected } = useRejectedMarketplaceAds({ enabled: isAuthed });

  const approveMutation = useApproveMarketplaceAd();
  const rejectMutation = useRejectMarketplaceAd();

  const adminUserId = session?.user?.email || '';
  const visibleAds = activeTab === 'published' ? (published || [])
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
    await approveMutation.mutateAsync({ adId: id, adminUserId });
    await refetchPending();
    await refetchPublished();
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason (required):') || '';
    if (!reason.trim()) return;
    await rejectMutation.mutateAsync({ adId: id, reason, adminUserId });
    await refetchPending();
    await refetchRejected();
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Marketplace</p>
            <h1 className="text-2xl font-bold">Marketplace Ads Review</h1>
            <p className="text-white/60 text-sm">Review paid ads, images, and approve for publishing.</p>
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

      {!visibleAds?.length ? (
        <Card className="p-10 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-semibold mb-2">Nothing to review</h3>
          <p className="text-white/60">No marketplace ads match this status right now.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleAds.map((ad) => {
            const isExpanded = expandedId === ad.id;
            return (
              <Card key={ad.id} className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-white">{ad.title}</h3>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                        {ad.status}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                        {ad.tier}
                      </span>
                    </div>
                    <p className="text-white/80">{ad.description}</p>

                    <div className="grid gap-2 text-sm text-white/60">
                      <div>
                        <span className="font-medium text-white/70">Category:</span> {ad.category}
                        {ad.subCategory ? ` / ${ad.subCategory}` : ''}
                      </div>
                      <div>
                        <span className="font-medium text-white/70">Post type:</span> {ad.postType || 'LOOKING_FOR'}
                      </div>
                      <div>
                        <span className="font-medium text-white/70">Submitted by:</span> {ad.user?.email || '--'}
                      </div>
                      <div>
                        <span className="font-medium text-white/70">Created:</span>{' '}
                        {new Date(ad.createdAt).toLocaleString()}
                      </div>
                      {ad.totalPrice !== null && ad.totalPrice !== undefined && (
                        <div>
                          <span className="font-medium text-white/70">Listing fee paid:</span>{' '}
                          ${Number(ad.totalPrice).toFixed(2)} {ad.priceCurrency || 'USDC'}
                        </div>
                      )}
                      {ad.priceAmount && (
                        <div>
                          <span className="font-medium text-white/70">Offer amount:</span>{' '}
                          {ad.priceAmount} {ad.priceCurrency || 'USDC'}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-white/70">
                      {ad.featuredPlacement && <span className="rounded-full border border-white/10 px-3 py-1">Featured</span>}
                      {ad.homepageSpotlight && <span className="rounded-full border border-white/10 px-3 py-1">Homepage Spotlight</span>}
                      {ad.topOfDayDays ? <span className="rounded-full border border-white/10 px-3 py-1">Top of Day: {ad.topOfDayDays}d</span> : null}
                      {ad.autoBumpDays ? <span className="rounded-full border border-white/10 px-3 py-1">Auto-bump: {ad.autoBumpDays}d</span> : null}
                      {ad.urgentTag && <span className="rounded-full border border-white/10 px-3 py-1">Urgent</span>}
                      {ad.multiChainTag && <span className="rounded-full border border-white/10 px-3 py-1">Multi-chain</span>}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2"
                      onClick={() => toggleExpanded(ad.id)}
                    >
                      {isExpanded ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {isExpanded ? 'Hide details' : 'View details'}
                    </Button>

                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-xl border border-white/10 bg-[#0B0B0B] p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Images</p>
                          {ad.images && ad.images.length ? (
                            <div className="grid gap-3 sm:grid-cols-3">
                              {ad.images.map((img, idx) => (
                                <div key={idx} className="rounded-lg border border-white/10 bg-black/40 p-2">
                                  <img
                                    src={getCloudFrontUrl(img)}
                                    alt={`${ad.title} ${idx + 1}`}
                                    className="h-28 w-full rounded-md object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-white/50 text-sm">
                              <ImageIcon className="h-4 w-4" />
                              No images uploaded
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {activeTab === 'pending' && (
                    <div className="flex flex-row gap-2">
                      <Button
                        onClick={() => handleApprove(ad.id)}
                        loading={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(ad.id)}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
