'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Wallet,
  DollarSign,
  BadgeCheck,
  Clock3,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Landmark,
} from 'lucide-react';
import {
  useApproveCreatorPayout,
  useCreatorPayouts,
  useMarkCreatorPayoutPaid,
  useRejectCreatorPayout,
} from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ExtendedSession } from '@/lib/auth';

const tabs = [
  { id: 'ALL', label: 'All', icon: Wallet },
  { id: 'REQUESTED', label: 'Requested', icon: Clock3 },
  { id: 'APPROVED', label: 'Approved', icon: BadgeCheck },
  { id: 'PROCESSING', label: 'Processing', icon: Clock3 },
  { id: 'PAID', label: 'Paid', icon: BadgeCheck },
  { id: 'REJECTED', label: 'Rejected', icon: ShieldAlert },
  { id: 'ON_HOLD', label: 'On Hold', icon: ShieldAlert },
] as const;

type TabId = (typeof tabs)[number]['id'];

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function getStatusTone(status: string) {
  switch (status) {
    case 'REQUESTED':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';
    case 'APPROVED':
      return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';
    case 'PROCESSING':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-300';
    case 'PAID':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
    case 'REJECTED':
      return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
    case 'ON_HOLD':
      return 'border-orange-500/30 bg-orange-500/10 text-orange-300';
    default:
      return 'border-white/10 bg-white/5 text-white/70';
  }
}

export default function AdminCreatorPayoutsPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as ExtendedSession | null)?.accessToken;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const isAuthed = status === 'authenticated' && Boolean(accessToken);
  const adminUserId = session?.user?.email || '';

  const payoutStatus = activeTab === 'ALL' ? undefined : activeTab;
  const { data: payoutData, isLoading, refetch } = useCreatorPayouts(
    { status: payoutStatus, limit: 100 },
    { enabled: isAuthed },
  );
  const approveMutation = useApproveCreatorPayout();
  const rejectMutation = useRejectCreatorPayout();
  const paidMutation = useMarkCreatorPayoutPaid();

  const payouts = payoutData?.payouts || [];

  const summary = useMemo(() => {
    const requested = payoutData?.payouts?.filter((payout) => payout.status === 'REQUESTED') || [];
    const paid = payoutData?.payouts?.filter((payout) => payout.status === 'PAID') || [];
    return {
      total: payoutData?.total || 0,
      requestedCount: requested.length,
      requestedAmount: requested.reduce((sum, payout) => sum + payout.amountRequested, 0),
      paidCount: paid.length,
    };
  }, [payoutData]);

  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner size="lg" color="#FF0075" />
      </div>
    );
  }

  const handleApprove = async (payoutId: string) => {
    try {
      setProcessingId(payoutId);
      const note = window.prompt('Optional approval note:') || undefined;
      await approveMutation.mutateAsync({ payoutId, adminUserId, note });
      await refetch();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (payoutId: string) => {
    const reason = window.prompt('Rejection reason (required):') || '';
    if (!reason.trim()) return;
    try {
      setProcessingId(payoutId);
      await rejectMutation.mutateAsync({ payoutId, adminUserId, reason });
      await refetch();
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkPaid = async (payoutId: string) => {
    const txHash = window.prompt('Transaction hash (required):') || '';
    if (!txHash.trim()) return;
    const note = window.prompt('Optional paid note:') || undefined;
    try {
      setProcessingId(payoutId);
      await paidMutation.mutateAsync({ payoutId, adminUserId, txHash, note });
      await refetch();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/admin" className="mt-1 text-white/60 transition-colors hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Creator Payouts</p>
            <h1 className="text-2xl font-bold md:text-3xl">Referral payout requests</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/60">
              Review creator payout requests, wallet addresses, and referral earnings from one place.
            </p>
          </div>
        </div>

        <Button onClick={() => refetch()} variant="secondary" className="self-start md:self-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Total requests</p>
          <p className="mt-3 text-3xl font-bold text-white">{summary.total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Pending requests</p>
          <p className="mt-3 text-3xl font-bold text-yellow-300">{summary.requestedCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Pending amount</p>
          <p className="mt-3 text-3xl font-bold text-cyan-300">{formatMoney(summary.requestedAmount)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Paid requests</p>
          <p className="mt-3 text-3xl font-bold text-emerald-300">{summary.paidCount}</p>
        </Card>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
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

      {!payouts.length ? (
        <Card className="p-10 text-center">
          <DollarSign className="mx-auto mb-4 h-16 w-16 text-white/30" />
          <h3 className="mb-2 text-xl font-semibold">No payout requests</h3>
          <p className="text-white/60">No creator payouts match this filter yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {payouts.map((payout) => (
            <Card key={payout.id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {payout.creatorUser?.name || payout.creatorUser?.email || `User ${payout.creatorUserId}`}
                      </h3>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(payout.status)}`}>
                        {payout.status}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-white/70 sm:grid-cols-2">
                      <div>
                        <span className="font-medium text-white/50">Email:</span>{' '}
                        <span className="break-all">{payout.creatorUser?.email || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-white/50">Referral code:</span>{' '}
                        <span className="font-mono">{payout.creatorAccount?.referralCode || '-'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-white/50">Wallet:</span>{' '}
                        <span className="break-all font-mono">{payout.walletAddress}</span>
                      </div>
                      <div>
                        <span className="font-medium text-white/50">Requested:</span>{' '}
                        {new Date(payout.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-left md:min-w-[180px] md:text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">Amount requested</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-300">
                      {formatMoney(payout.amountRequested)}
                    </p>
                    <p className="text-xs text-white/50">
                      Reserved: {formatMoney(payout.creatorAccount?.reservedBalance || 0)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">Creator tier</p>
                    <p className="mt-1 text-sm font-medium text-white">{payout.creatorAccount?.tier || 'Unknown'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">Fraud status</p>
                    <p className="mt-1 text-sm font-medium text-white">{payout.creatorAccount?.fraudStatus || 'CLEAR'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">Request note</p>
                    <p className="mt-1 text-sm text-white/80">{payout.requestNote || 'No note provided'}</p>
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-white/60 sm:grid-cols-3">
                  <div>
                    <span className="font-medium text-white/50">Created:</span>{' '}
                    {new Date(payout.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-white/50">Updated:</span>{' '}
                    {new Date(payout.updatedAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-white/50">Approved amount:</span>{' '}
                    {payout.amountApproved != null ? formatMoney(payout.amountApproved) : '-'}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleApprove(payout.id)}
                    loading={processingId === payout.id && approveMutation.isPending}
                    disabled={processingId !== null}
                    className="justify-center"
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMarkPaid(payout.id)}
                    loading={processingId === payout.id && paidMutation.isPending}
                    disabled={processingId !== null}
                    className="justify-center"
                  >
                    <Landmark className="mr-1 h-4 w-4" />
                    Mark Paid
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleReject(payout.id)}
                    loading={processingId === payout.id && rejectMutation.isPending}
                    disabled={processingId !== null}
                    className="justify-center"
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
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
