'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Users, Wallet, Activity } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { ExtendedSession } from '@/lib/auth';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as ExtendedSession | null)?.accessToken;
  const router = useRouter();
  const [query, setQuery] = useState('');
  const isAuthed = status === 'authenticated' && Boolean(accessToken);
  const { data: users, isLoading } = useAdminUsers(
    { search: query || undefined, limit: 50 },
    { enabled: isAuthed }
  );
  const visibleUsers = users || [];

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Users</p>
            <h1 className="text-2xl font-bold">User Directory</h1>
            <p className="text-white/60 text-sm">Search and manage registered users.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Users className="w-4 h-4" />
          {visibleUsers.length} users loaded
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#121212] p-4">
        <label className="text-xs uppercase tracking-[0.3em] text-white/40">
          Search by username or email
        </label>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users..."
          className="rounded-lg border border-white/10 bg-[#0B0B0B] px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
        />
      </div>

      {!visibleUsers.length ? (
        <Card className="p-10 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-semibold mb-2">No users found</h3>
          <p className="text-white/60">Try a different search term.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleUsers.map((user) => {
            const displayName = user.name || (user.email ? user.email.split('@')[0] : 'Unnamed user');
            return (
            <Card key={user.id} className="p-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{displayName}</p>
                    <p className="text-sm text-white/60">{user.email}</p>
                    {user.privyDid && (
                      <p className="text-xs text-white/40 mt-1">Privy: {user.privyDid}</p>
                    )}
                    <p className="text-xs text-white/40 mt-1">
                      Joined {new Date(user.createdAt).toLocaleDateString()} ? Last login{' '}
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-white/60">
                    <div>
                      Role: <span className="text-white">{user.role || 'USER'}</span>
                    </div>
                    <div>
                      Wallets: <span className="text-white">{user._count?.wallets ?? user.wallets.length}</span>
                    </div>
                    <div>
                      Listings: <span className="text-white">{user._count?.userListings ?? 0}</span>
                    </div>
                    <div>
                      Payments: <span className="text-white">{user._count?.payments ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {user.wallets.map((wallet) => (
                    <div key={wallet.id} className="rounded-xl border border-white/10 bg-[#0B0B0B] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Wallet className="w-4 h-4" />
                          {wallet.blockchain}
                        </div>
                        {wallet.isPrimary && (
                          <span className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/60">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 break-all">{wallet.address || 'No address'}</p>
                      <div className="mt-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Balances</p>
                        {wallet.walletBalances.length ? (
                          <div className="mt-2 space-y-1 text-xs text-white/60">
                            {wallet.walletBalances.slice(0, 3).map((balance) => (
                              <div key={balance.tokenAddress} className="flex justify-between">
                                <span>{balance.tokenSymbol}</span>
                                <span>{balance.balance}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40 mt-2">No balances recorded</p>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                          <Activity className="w-3 h-3" />
                          Recent Transactions
                        </div>
                        {wallet.walletTransactions.length ? (
                          <div className="mt-2 space-y-1 text-xs text-white/60">
                            {wallet.walletTransactions.slice(0, 3).map((tx) => (
                              <div key={tx.txHash} className="flex justify-between">
                                <span>{tx.txType}</span>
                                <span>{tx.amount} {tx.tokenSymbol}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40 mt-2">No transactions recorded</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}
