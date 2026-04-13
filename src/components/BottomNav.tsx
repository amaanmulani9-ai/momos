'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User, Tag } from 'lucide-react';
import { useCart } from '@/lib/store';

const TABS = [
  { href: '/', label: 'HOME', icon: Home },
  { href: '/menu', label: 'SEARCH', icon: Search },
  { href: '/wishlist', label: 'DEALS', icon: Tag },
  { href: '/cart', label: 'CART', icon: ShoppingBag },
  { href: '/profile', label: 'PROFILE', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/order') ||
    pathname.startsWith('/login')
  ) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.06)] lg:hidden rounded-t-[32px]">
      <div className="mx-auto flex h-[80px] max-w-xl items-center justify-around px-4 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.href === '/'
              ? pathname === '/'
              : tab.href === '/menu'
                ? pathname.startsWith('/menu') || pathname.startsWith('/restaurant')
                : pathname.startsWith(tab.href);

          return (
            <Link key={tab.href} href={tab.href} className="relative flex flex-col items-center gap-1.5 py-2 px-3 text-center">
              <div className="relative">
                <Icon className="h-5 w-5" style={{ color: active ? '#e04d01' : '#a3a3a3' }} />
                {tab.href === '/cart' && itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#cc0000] px-1 text-[9px] font-bold text-white shadow-sm">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-wide" style={{ color: active ? '#e04d01' : '#a3a3a3' }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

