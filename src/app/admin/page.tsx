"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MoonLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { FileText, DollarSign, Zap, Users } from 'lucide-react';

interface DashboardStats {
  users: { total: number };
  listings: { total: number; pending: number; published: number; rejected: number };
  payments: { total: number; completed: number; pending: number; revenue: number; currency: string };
  adBoosts: { active: number };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = 'https://cto-backend-production-28e3.up.railway.app';

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${(session as Record<string, unknown>)?.accessToken || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [session, baseUrl]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      loadStats();
    }
  }, [status, router, loadStats]);

  if (status === 'loading' || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <MoonLoader size={40} color="#FF0075" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2"
              style={{
                background: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
            🛡️ Admin Dashboard
          </h1>
          <p className="text-white/60">Manage listings, payments, and ad boosts</p>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/listings"
            className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 hover:border-yellow-500 transition-colors"
          >
            <FileText className="w-8 h-8 mb-3 text-yellow-500" />
            <h3 className="font-semibold text-lg">Pending Listings</h3>
            <p className="text-2xl font-bold text-yellow-500 mt-2">
              {stats?.listings.pending || 0}
            </p>
          </Link>

          <Link
            href="/admin/payments"
            className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 hover:border-green-500 transition-colors"
          >
            <DollarSign className="w-8 h-8 mb-3 text-green-500" />
            <h3 className="font-semibold text-lg">Payments</h3>
            <p className="text-2xl font-bold text-green-500 mt-2">
              {stats?.payments.completed || 0}
            </p>
          </Link>

          <Link
            href="/admin/boosts"
            className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 hover:border-orange-500 transition-colors"
          >
            <Zap className="w-8 h-8 mb-3 text-orange-500" />
            <h3 className="font-semibold text-lg">Active Boosts</h3>
            <p className="text-2xl font-bold text-orange-500 mt-2">
              {stats?.adBoosts.active || 0}
            </p>
          </Link>

          <Link
            href="/meme-dashboard"
            className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 hover:border-purple-500 transition-colors"
          >
            <Users className="w-8 h-8 mb-3 text-purple-500" />
            <h3 className="font-semibold text-lg">Meme Dashboard</h3>
            <p className="text-sm text-white/60 mt-2">Upload memes</p>
          </Link>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm font-semibold">Total Users</h3>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-500">{stats.users.total}</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm font-semibold">Total Listings</h3>
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-500">{stats.listings.total}</p>
              <p className="text-xs text-white/50 mt-2">
                {stats.listings.published} published, {stats.listings.pending} pending
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm font-semibold">Total Revenue</h3>
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-500">
                ${stats.payments.revenue.toFixed(2)}
              </p>
              <p className="text-xs text-white/50 mt-2">{stats.payments.currency}</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm font-semibold">Active Boosts</h3>
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-500">{stats.adBoosts.active}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={loadStats}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Refresh Data
            </button>
            <Link
              href="/admin/listings"
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg transition-colors text-center"
            >
              📝 Review Pending Listings
            </Link>
            <Link
              href="/admin/payments"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors text-center"
            >
              💰 View Payments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

