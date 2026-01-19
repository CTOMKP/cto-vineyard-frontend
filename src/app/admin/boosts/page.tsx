'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Zap } from 'lucide-react';
import { useActiveBoosts } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminBoostsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { data: boosts, isLoading, refetch } = useActiveBoosts();

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

  const getBoostTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      top: 'bg-red-500/20 text-red-500',
      priority: 'bg-orange-500/20 text-orange-500',
      bump: 'bg-yellow-500/20 text-yellow-500',
      spotlight: 'bg-purple-500/20 text-purple-500',
      homepage: 'bg-pink-500/20 text-pink-500',
      urgent: 'bg-blue-500/20 text-blue-500',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-500';
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Boosts</p>
            <h1 className="text-2xl font-bold">Active Promotions</h1>
            <p className="text-white/60 text-sm">Track all listing visibility boosts.</p>
          </div>
        </div>
        <Button onClick={() => refetch()} variant="secondary">
          Refresh
        </Button>
      </div>

      {!boosts?.length ? (
        <Card className="p-10 text-center">
          <Zap className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-semibold mb-2">No Active Boosts</h3>
          <p className="text-white/60">No listings are currently boosted.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {boosts.map((boost) => (
            <Card key={boost.id} className="p-6 hover:border-orange-500/50 transition-colors">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">
                      {boost.listing?.title || 'Unknown Listing'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getBoostTypeColor(
                        boost.type
                      )}`}
                    >
                      {boost.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-white/70">
                    <p>
                      <span className="text-white/50">Contract:</span>{' '}
                      <code className="bg-[#262626] px-2 py-1 rounded text-xs">
                        {boost.listing?.contractAddr || 'N/A'}
                      </code>
                    </p>
                    <p>
                      <span className="text-white/50">Owner:</span>{' '}
                      {boost.listing?.user?.email || 'Unknown'}
                    </p>
                    <p>
                      <span className="text-white/50">Duration:</span> {boost.durationDays} days
                    </p>
                    <p>
                      <span className="text-white/50">Started:</span>{' '}
                      {new Date(boost.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="text-white/50">Ends:</span>{' '}
                      {new Date(boost.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg text-sm font-semibold">
                    Active
                  </span>
                  <span className="text-sm text-white/60">
                    {getDaysRemaining(boost.endDate)} days remaining
                  </span>
                  {getDaysRemaining(boost.endDate) <= 2 && (
                    <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded text-xs">
                      Expiring Soon
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
