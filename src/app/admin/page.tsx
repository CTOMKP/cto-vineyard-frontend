'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, DollarSign, Zap, Users, RefreshCw } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminPage() {
  const { status } = useSession();
  const router = useRouter();
  const { data: stats, isLoading, refetch } = useAdminStats();

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Metrics</p>
        <h1 className="text-3xl font-bold">Admin Control Center</h1>
        <p className="text-white/60">
          Track listing flow, revenue, and marketplace health at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/admin/listings">
          <Card hover className="p-6">
            <FileText className="w-8 h-8 mb-3 text-yellow-500" />
            <h3 className="font-semibold text-lg">Pending Listings</h3>
            <p className="text-2xl font-bold text-yellow-500 mt-2">
              {stats?.listings.pending || 0}
            </p>
          </Card>
        </Link>

        <Link href="/admin/payments">
          <Card hover className="p-6">
            <DollarSign className="w-8 h-8 mb-3 text-green-500" />
            <h3 className="font-semibold text-lg">Payments</h3>
            <p className="text-2xl font-bold text-green-500 mt-2">
              {stats?.payments.completed || 0}
            </p>
          </Card>
        </Link>

        <Link href="/admin/boosts">
          <Card hover className="p-6">
            <Zap className="w-8 h-8 mb-3 text-orange-500" />
            <h3 className="font-semibold text-lg">Active Boosts</h3>
            <p className="text-2xl font-bold text-orange-500 mt-2">
              {stats?.adBoosts.active || 0}
            </p>
          </Card>
        </Link>

        <Link href="/dashboard">
          <Card hover className="p-6">
            <Users className="w-8 h-8 mb-3 text-purple-500" />
            <h3 className="font-semibold text-lg">Meme Dashboard</h3>
            <p className="text-sm text-white/60 mt-2">Upload memes</p>
          </Card>
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 text-sm font-semibold">Total Users</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-500">{stats.users.total}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 text-sm font-semibold">Total Listings</h3>
              <FileText className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-500">{stats.listings.total}</p>
            <p className="text-xs text-white/50 mt-2">
              {stats.listings.published} published, {stats.listings.pending} pending
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 text-sm font-semibold">Total Revenue</h3>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-500">
              ${stats.payments.revenue.toFixed(2)}
            </p>
            <p className="text-xs text-white/50 mt-2">{stats.payments.currency}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 text-sm font-semibold">Active Boosts</h3>
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-500">{stats.adBoosts.active}</p>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={() => refetch()} variant="secondary" className="justify-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Link href="/admin/listings">
            <Button variant="secondary" className="w-full justify-center">
              Review Pending Listings
            </Button>
          </Link>
          <Link href="/admin/payments">
            <Button variant="secondary" className="w-full justify-center">
              View Payments
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
