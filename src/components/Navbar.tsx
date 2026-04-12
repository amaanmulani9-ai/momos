'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Menu, X, MapPin, ChevronDown, Search } from 'lucide-react';
import { useCart } from '@/lib/store';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { itemCount, toggleCart, total } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -70 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(7,6,15,0.97)' : '#07060f',
          borderBottom: `1px solid ${scrolled ? 'rgba(255,107,107,0.15)' : 'rgba(255,255,255,0.04)'}`,
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <nav className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}>
              🥟
            </div>
            <div className="hidden sm:block">
              <p className="font-black text-sm leading-none gradient-text">Meghna's</p>
              <p className="text-orange-100/60 text-xs leading-none">Kitchen</p>
            </div>
          </Link>

          {/* Location pill */}
          <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-white/5 shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-orange-100 leading-none">Sector 18</p>
              <p className="text-xs text-orange-100/40 leading-none">Noida, UP</p>
            </div>
            <ChevronDown className="w-3 h-3 text-orange-100/40" />
          </button>

          {/* Search bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm relative">
            <Search className="absolute left-3 w-4 h-4 text-orange-100/30" />
            <Link href="/menu"
              className="w-full pl-10 py-2 rounded-xl text-sm text-orange-100/40 cursor-pointer transition-colors hover:border-orange-500/50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'block' }}>
              Search for dishes...
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className="text-sm font-medium text-orange-100/70 hover:text-orange-400 transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-400 group-hover:w-full transition-all duration-300 rounded-full" />
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cart */}
            <button id="navbar-cart-btn" onClick={toggleCart}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-white/10"
              aria-label="Open cart">
              <ShoppingCart className="w-5 h-5 text-orange-100" />
              {itemCount > 0 && (
                <>
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ background: '#FF6B6B' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                  <span className="hidden sm:block text-sm font-bold text-orange-100">₹{total}</span>
                </>
              )}
            </button>

            <Link href="/menu" className="hidden sm:block btn-primary text-sm py-2 px-4">Order Now</Link>

            {/* Mobile toggle */}
            <button className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? <X className="w-5 h-5 text-orange-100" /> : <Menu className="w-5 h-5 text-orange-100" />}
            </button>
          </div>
        </nav>

        {/* Offer ticker */}
        <div className="overflow-hidden py-1.5 px-4 text-center text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(90deg, #ff7c00, #e74c3c)' }}>
          <div className="marquee-track whitespace-nowrap inline-block">
            🎉 50% off on first order · Use code NEW50 &nbsp;|&nbsp; 🛵 Free delivery above ₹300 &nbsp;|&nbsp; ⏱️ 30 min delivery &nbsp;|&nbsp; 🥟 60+ dishes &nbsp;|&nbsp; ⭐ 4.9 stars rated &nbsp;|&nbsp;
            🎉 50% off on first order · Use code NEW50 &nbsp;|&nbsp; 🛵 Free delivery above ₹300 &nbsp;|&nbsp; ⏱️ 30 min delivery &nbsp;|&nbsp; 🥟 60+ dishes &nbsp;|&nbsp; ⭐ 4.9 stars rated &nbsp;|&nbsp;
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 right-0 z-40"
            style={{ background: '#07060f', borderBottom: '1px solid rgba(255,107,107,0.2)' }}
          >
            <div className="flex flex-col p-4 gap-2">
              {/* Location */}
              <div className="flex items-center gap-2 p-3 rounded-xl mb-2" style={{ background: 'rgba(255,124,0,0.08)', border: '1px solid rgba(255,124,0,0.2)' }}>
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-100">Sector 18, Noida, UP</span>
              </div>

              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  className="text-orange-100 py-3 px-4 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
                  onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/menu" className="btn-primary text-center text-sm mt-2 justify-center"
                onClick={() => setMobileOpen(false)}>
                🛵 Order Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
