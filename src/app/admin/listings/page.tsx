'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, FileText, CheckCircle, XCircle } from 'lucide-react';
import { usePendingListings, useApproveListing, useRejectListing } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminListingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { data: listings, isLoading, refetch } = usePendingListings();
  const approveMutation = useApproveListing();
  const rejectMutation = useRejectListing();

  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="#FF0075" />
      </div>
    );
  }

  const handleApprove = async (id: string) => {
    await approveMutation.mutateAsync(id);
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason (optional):');
    await rejectMutation.mutateAsync({ id, reason: reason || undefined });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white/60 hover:text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold gradient-text">📝 Pending Listings</h1>
              <p className="text-white/60 text-sm">Review and approve new listings</p>
            </div>
          </div>
          <Button onClick={() => refetch()} variant="secondary">
            🔄 Refresh
          </Button>
        </div>

        {/* Listings */}
        {!listings?.length ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <h3 className="text-xl font-semibold mb-2">No Pending Listings</h3>
            <p className="text-white/60">All listings have been reviewed</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="p-6">
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{listing.title}</h3>
                    <div className="space-y-2 text-sm">
                      {listing.description && (
                        <p className="text-white/80">{listing.description}</p>
                      )}
                      <p className="text-white/60">
                        <span className="font-medium">Contract:</span>{' '}
                        <code className="bg-[#262626] px-2 py-1 rounded text-xs">
                          {listing.contractAddr}
                        </code>
                      </p>
                      <p className="text-white/60">
                        <span className="font-medium">Submitted by:</span> {listing.user?.email}
                      </p>
                      <p className="text-white/60">
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

