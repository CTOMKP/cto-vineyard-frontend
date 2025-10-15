"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MoonLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { ChevronLeft, DollarSign } from 'lucide-react';

interface Payment {
  id: string;
  userId: number;
  paymentType: string;
  listingId?: string;
  adBoostId?: string;
  amount: number;
  currency: string;
  status: string;
  transferId?: string;
  txHash?: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
  user: {
    email: string;
  };
}

export default function AdminPayments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const baseUrl = 'https://cto-backend-production-28e3.up.railway.app';

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('paymentType', filterType);
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(
        `${baseUrl}/api/admin/payments${params.toString() ? '?' + params.toString() : ''}`,
        {
          headers: {
            Authorization: `Bearer ${(session as unknown as Record<string, unknown>)?.accessToken || ''}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load payments');
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [session, baseUrl, filterType, filterStatus]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadPayments();
    }
  }, [status, router, loadPayments]);

  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

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
                💰 Payments
              </h1>
              <p className="text-white/60 text-sm">View all platform payments</p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-white/60 text-sm mb-1">Total Payments</p>
              <p className="text-3xl font-bold">{payments.length}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-500">${totalRevenue.toFixed(2)} USDC</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold text-blue-500">
                {payments.filter(p => p.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="filterType" className="block text-white/60 text-sm mb-2">Filter by Type</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-[#262626] border border-[#404040] rounded px-3 py-2 text-white"
                aria-label="Filter payments by type"
              >
                <option value="">All Types</option>
                <option value="LISTING">Listing Payments</option>
                <option value="AD_BOOST">Ad Boost Payments</option>
                <option value="ESCROW">Escrow Payments</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterStatus" className="block text-white/60 text-sm mb-2">Filter by Status</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-[#262626] border border-[#404040] rounded px-3 py-2 text-white"
                aria-label="Filter payments by status"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadPayments}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        {payments.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-12 text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <h3 className="text-xl font-semibold mb-2">No Payments Found</h3>
            <p className="text-white/60">No payments match your filters</p>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#262626]">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/60">TX Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-t border-[#262626] hover:bg-[#262626]/50">
                      <td className="py-3 px-4 text-xs text-white/80">
                        {payment.id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          payment.paymentType === 'LISTING' ? 'bg-blue-500/20 text-blue-500' :
                          payment.paymentType === 'AD_BOOST' ? 'bg-orange-500/20 text-orange-500' :
                          'bg-purple-500/20 text-purple-500'
                        }`}>
                          {payment.paymentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-white/80">
                        {payment.user?.email || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-green-500">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          payment.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' :
                          payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                          payment.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-white/60">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-xs text-white/60">
                        {payment.txHash ? (
                          <code className="bg-[#262626] px-2 py-1 rounded">
                            {payment.txHash.substring(0, 6)}...
                          </code>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

