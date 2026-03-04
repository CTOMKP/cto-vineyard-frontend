'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  BarChart3,
  ClipboardList,
  Users,
  CreditCard,
  Rocket,
  Shield,
  Megaphone,
  Scale,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAdminNotifications, useMarkAdminNotificationRead } from '@/hooks/useAdmin';
import type { ExtendedSession } from '@/lib/auth';
import type { NotificationItem } from '@/types';

const navItems = [
  { href: '/admin', label: 'Metrics', icon: BarChart3 },
  { href: '/admin/listings', label: 'User Listings', icon: ClipboardList },
  { href: '/admin/marketplace-ads', label: 'Marketplace Ads', icon: Megaphone },
  { href: '/admin/escrows', label: 'Escrows', icon: Scale },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/boosts', label: 'Boosts', icon: Rocket },
];

function formatTimeAgo(dateIso: string) {
  const timestamp = new Date(dateIso).getTime();
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getNotificationRoute(notification: NotificationItem) {
  switch (notification.type) {
    case 'ESCROW':
      return '/admin/escrows';
    case 'PAYMENT':
      return '/admin/payments';
    case 'LISTING_APPROVAL':
      return '/admin/listings';
    case 'AD_APPROVAL':
      return '/admin/marketplace-ads';
    default:
      return '/admin';
  }
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const accessToken = (session as ExtendedSession | null)?.accessToken;
  const isAuthed = status === 'authenticated' && Boolean(accessToken);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const notificationsPanelRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [], isLoading: isLoadingNotifications } = useAdminNotifications({
    enabled: isAuthed,
    refetchInterval: 10_000,
  });
  const markReadMutation = useMarkAdminNotificationRead();

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.readAt),
    [notifications],
  );
  const unreadCount = unreadNotifications.length;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isNotificationsOpen &&
        notificationsPanelRef.current &&
        !notificationsPanelRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationsOpen]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.readAt) {
      await markReadMutation.mutateAsync(notification.id);
    }
    setIsNotificationsOpen(false);
    router.push(getNotificationRoute(notification));
  };

  const handleMarkAllRead = async () => {
    if (!unreadNotifications.length || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      for (const notification of unreadNotifications) {
        await markReadMutation.mutateAsync(notification.id);
      }
    } finally {
      setIsMarkingAll(false);
    }
  };

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
          <div className="mb-4 flex justify-end">
            <div className="relative" ref={notificationsPanelRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0E0E0E] text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Admin notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-semibold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(92vw,380px)] rounded-xl border border-white/10 bg-[#101010] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Notifications</p>
                      <p className="text-xs text-white/50">{unreadCount} unread</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={handleMarkAllRead}
                      disabled={!unreadCount || isMarkingAll || markReadMutation.isPending}
                    >
                      <CheckCheck className="mr-1 h-3.5 w-3.5" />
                      Mark all read
                    </Button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="px-4 py-8 text-center text-sm text-white/60">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-white/60">No notifications yet</div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={`block w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 ${
                            notification.readAt ? 'bg-transparent' : 'bg-white/[0.03]'
                          }`}
                        >
                          <div className="mb-1 flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <span className="shrink-0 text-[11px] text-white/45">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          {notification.body && (
                            <p className="line-clamp-2 text-xs text-white/60">{notification.body}</p>
                          )}
                          {!notification.readAt && <p className="mt-2 text-[11px] text-rose-400">Unread</p>}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

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
