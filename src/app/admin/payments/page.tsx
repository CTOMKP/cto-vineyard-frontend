'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, DollarSign } from 'lucide-react';
import { usePayments } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminPaymentsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: payments, isLoading, refetch } = usePayments({ status: statusFilter || undefined });

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

  const getStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'failed':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
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
              <h1 className="text-3xl font-bold gradient-text">💰 Payments</h1>
              <p className="text-white/60 text-sm">View all payment transactions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/40"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <Button onClick={() => refetch()} variant="secondary">
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Payments */}
        {!payments?.length ? (
          <Card className="p-12 text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <h3 className="text-xl font-semibold mb-2">No Payments</h3>
            <p className="text-white/60">No payment transactions found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">
                        {payment.listing?.title || 'Unknown Listing'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-white/60 space-y-1">
                      <p>User: {payment.user?.email || 'Unknown'}</p>
                      <p>Date: {new Date(payment.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">
                      ${payment.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-white/50">{payment.currency}</p>
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

