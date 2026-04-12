'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Home, UtensilsCrossed, ShoppingCart, Heart, User } from 'lucide-react';
import { useCart } from '@/lib/store';

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();

  // Hide on checkout and order success
  if (pathname.startsWith('/checkout') || pathname.startsWith('/order')) return null;

  const TABS = [
    { href: '/',         icon: Home,            label: 'Home',    action: null },
    { href: '/menu',     icon: UtensilsCrossed, label: 'Menu',    action: null },
    { href: null,        icon: ShoppingCart,    label: 'Cart',    action: toggleCart, badge: true },
    { href: '/wishlist', icon: Heart,           label: 'Saved',   action: null },
    { href: '/profile',  icon: User,            label: 'Profile', action: null },
  ];

  return (
    <motion.nav
      initial={{ y: 80 }} animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2"
      style={{
        background: 'rgba(10,9,20,0.97)',
        borderTop: '1px solid rgba(255,107,107,0.12)',
        backdropFilter: 'blur(20px)',
        height: '60px',
      }}
    >
      {TABS.map(({ href, icon: Icon, label, action, badge }) => {
        const active = href
          ? (href === '/' ? pathname === '/' : pathname.startsWith(href))
          : false;

        const inner = (
          <>
            {/* Active indicator */}
            {active && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg, #FF6B6B, #FF8E53)' }}
              />
            )}
            <div className="relative">
              <Icon
                className="w-5 h-5 transition-all"
                style={{ color: active ? '#FF6B6B' : 'rgba(250,250,250,0.4)' }}
                strokeWidth={active ? 2.5 : 1.8}
              />
              {/* Cart badge */}
              {badge && itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-white font-black"
                  style={{ background: '#FF6B6B', fontSize: '9px' }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </div>
            <span className="text-[10px] font-semibold transition-colors leading-none mt-0.5"
              style={{ color: active ? '#FF6B6B' : 'rgba(250,250,250,0.35)' }}>
              {label}
            </span>
          </>
        );

        if (action) {
          return (
            <button
              key={label}
              onClick={action}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 group"
            >
              {inner}
            </button>
          );
        }

        return (
          <Link key={label} href={href!} className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 group">
            {inner}
          </Link>
        );
      })}
    </motion.nav>
  );
}
