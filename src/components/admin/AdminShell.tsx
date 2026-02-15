'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ClipboardList, Users, CreditCard, Rocket, Shield, Megaphone, Scale } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const navItems = [
  { href: '/admin', label: 'Metrics', icon: BarChart3 },
  { href: '/admin/listings', label: 'User Listings', icon: ClipboardList },
  { href: '/admin/marketplace-ads', label: 'Marketplace Ads', icon: Megaphone },
  { href: '/admin/escrows', label: 'Escrows', icon: Scale },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/boosts', label: 'Boosts', icon: Rocket },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        <aside className="hidden w-64 shrink-0 rounded-2xl border border-white/10 bg-[#0E0E0E] p-4 md:block">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF0075] via-[#FF4A15] to-[#FFCB45] text-black">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">CTO Admin</p>
              <p className="text-sm font-semibold">Vineyard Console</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-[#121212] p-3 text-xs text-white/60">
            Use this console to review listings, approve payouts, and keep the marketplace clean.
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0E0E0E] px-4 py-3 md:hidden">
            <div className="text-sm font-semibold">Admin Console</div>
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    size="sm"
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0E0E0E] p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
