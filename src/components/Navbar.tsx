'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/format';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Food' },
  { href: '/login', label: 'Login' },
  { href: '/profile', label: 'Profile' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, total, toggleCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: scrolled ? 'rgba(8, 10, 16, 0.92)' : 'rgba(8, 10, 16, 0.78)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <nav className="app-container flex h-[72px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ff8a5b,#ff5d6c)] text-base font-black text-white shadow-[0_18px_45px_rgba(255,93,108,0.35)]">
              MK
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-white/40">MEGHNA'S</p>
              <p className="font-display text-xl text-white">Momos</p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm font-medium transition-colors"
                  style={{ color: active ? '#ffffff' : 'rgba(255,255,255,0.58)' }}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[linear-gradient(90deg,#ff8a5b,#ff5d6c)]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden max-w-sm flex-1 items-center lg:flex">
            <Link href="/menu" className="app-search-link">
              <Search className="h-4 w-4 text-white/35" />
              <span>Search dishes, combos, and offers</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/menu" className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white md:inline-flex">
              Order now
            </Link>

            <button
              type="button"
              onClick={toggleCart}
              className="relative inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white transition-colors hover:border-white/20"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{itemCount > 0 ? formatPrice(total) : 'Cart'}</span>
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff8a5b,#ff5d6c)] px-1 text-[10px] font-bold text-white">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-x-0 top-[72px] z-40 border-b border-white/10 bg-[rgba(8,10,16,0.97)] backdrop-blur-2xl lg:hidden"
          >
            <div className="app-container flex flex-col gap-3 py-4">
              <Link href="/menu" className="app-search-link">
                <Search className="h-4 w-4 text-white/35" />
                <span>Search the full menu</span>
              </Link>

              {NAV_LINKS.map((link) => {
                const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl border px-4 py-3 text-sm font-medium"
                    style={{
                      borderColor: active ? 'rgba(255,138,91,0.35)' : 'rgba(255,255,255,0.08)',
                      background: active ? 'rgba(255,138,91,0.08)' : 'transparent',
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.72)',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

