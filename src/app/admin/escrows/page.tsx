'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, BadgeCheck, Clock, Ban, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {
  useEscrows,
  useForceReleaseEscrow,
  useForceRefundEscrow,
  useExtendEscrow,
  useFreezeEscrow,
  useFlagEscrow,
  useResolveEscrowDispute,
} from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ExtendedSession } from '@/lib/auth';

const tabs = [
  { id: 'PROPOSED', label: 'Proposed', icon: Clock },
  { id: 'AWAITING_PAYMENT', label: 'Awaiting Payment', icon: Clock },
  { id: 'FUNDED_ACTIVE', label: 'Active', icon: BadgeCheck },
  { id: 'UNDER_REVIEW', label: 'Under Review', icon: AlertTriangle },
  { id: 'COMPLETED', label: 'Completed', icon: BadgeCheck },
  { id: 'REFUNDED', label: 'Refunded', icon: Ban },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function AdminEscrowsPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as ExtendedSession | null)?.accessToken;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('PROPOSED');
  const isAuthed = status === 'authenticated' && Boolean(accessToken);

  const { data: escrows, isLoading, refetch } = useEscrows(activeTab, { enabled: isAuthed });

  const adminUserId = session?.user?.email || '';
  const releaseMutation = useForceReleaseEscrow();
  const refundMutation = useForceRefundEscrow();
  const extendMutation = useExtendEscrow();
  const freezeMutation = useFreezeEscrow();
  const flagMutation = useFlagEscrow();
  const resolveMutation = useResolveEscrowDispute();

  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[240px] flex items-center justify-center">
        <Spinner size="lg" color="#FF0075" />
      </div>
    );
  }

  const handleRelease = async (id: string) => {
    await releaseMutation.mutateAsync({ escrowId: id, adminUserId });
    refetch();
  };

  const handleRefund = async (id: string) => {
    await refundMutation.mutateAsync({ escrowId: id, adminUserId });
    refetch();
  };

  const handleExtend = async (id: string) => {
    const newDeadline = prompt('New deadline (YYYY-MM-DD):') || '';
    if (!newDeadline.trim()) return;
    await extendMutation.mutateAsync({ escrowId: id, adminUserId, newDeadline });
    refetch();
  };

  const handleFreeze = async (id: string) => {
    await freezeMutation.mutateAsync({ escrowId: id, adminUserId });
    refetch();
  };

  const handleFlag = async (id: string) => {
    const reason = prompt('Flag reason (optional):') || '';
    await flagMutation.mutateAsync({ escrowId: id, adminUserId, reason });
    refetch();
  };

  const handleResolve = async (id: string) => {
    await resolveMutation.mutateAsync({ escrowId: id, adminUserId });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Escrow</p>
            <h1 className="text-2xl font-bold">Escrow Management</h1>
            <p className="text-white/60 text-sm">Review and administer escrow lifecycle.</p>
          </div>
        </div>
        <Button onClick={() => refetch()} variant="secondary">
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

      {!escrows?.length ? (
        <Card className="p-10 text-center">
          <h3 className="text-xl font-semibold mb-2">No escrows</h3>
          <p className="text-white/60">Nothing to review for this status.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {escrows.map((escrow) => (
            <Card key={escrow.id} className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{escrow.title}</h3>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/60">
                      {escrow.status}
                    </span>
                    {escrow.isFrozen && (
                      <span className="rounded-full border border-rose-500/40 px-2 py-1 text-xs text-rose-400">
                        Frozen
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white/60">
                    Amount: {escrow.totalAmount} {escrow.currency}
                  </div>
                  <div className="text-sm text-white/60">
                    Deadline: {escrow.deadline ? new Date(escrow.deadline).toLocaleDateString() : 'No deadline'}
                  </div>
                  <div className="text-xs text-white/40">
                    Created: {new Date(escrow.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleExtend(escrow.id)}>
                    Extend
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleFreeze(escrow.id)}>
                    Freeze
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleFlag(escrow.id)}>
                    Flag
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleResolve(escrow.id)}>
                    Resolve
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRelease(escrow.id)}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Release
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleRefund(escrow.id)}>
                    <XCircle className="w-4 h-4 mr-1" />
                    Refund
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
