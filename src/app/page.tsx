'use client';

import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { PRODUCTS, SHOP_INFO, REVIEWS } from '@/lib/data';
import { useCart } from '@/lib/store';
import { Star, Clock, Search, ChevronRight, ChevronLeft, Zap, Flame, Bike } from 'lucide-react';
import { ScrollProgressBar, ScrollToTop, AnimatedCounter } from '@/components/ScrollEffects';

// ────────────────────────────────────
// Hero Slides  (Slider Revolution style)
// ────────────────────────────────────
const SLIDES = [
  {
    tag: '🔥 Trending Now',
    title: 'Authentic\nMomos',
    subtitle: 'Handcrafted dumplings with secret chutney. 30 min delivery guaranteed.',
    cta: 'Order Momos',
    ctaLink: '/menu?cat=steam',
    color1: '#FF6B6B',
    color2: '#FF8E53',
    emoji: '🥟',
    bg: 'radial-gradient(ellipse at 70% 50%, rgba(255,107,107,0.18) 0%, transparent 70%)',
    image: '/images/hero-momos.png',
  },
  {
    tag: '🍕 Most Ordered',
    title: 'Wood-Fired\nPizza',
    subtitle: 'Crispy thin crust, premium toppings, molten cheese — made fresh.',
    cta: 'Order Pizza',
    ctaLink: '/menu?cat=pizza',
    color1: '#FFC857',
    color2: '#FF8E53',
    emoji: '🍕',
    bg: 'radial-gradient(ellipse at 70% 50%, rgba(255,200,87,0.18) 0%, transparent 70%)',
    image: '/images/hero-pizza.png',
  },
  {
    tag: '🌏 Asian Street',
    title: 'Chinese\nFood',
    subtitle: 'Hakka noodles, Manchurian, Spring Rolls — wok-tossed to perfection.',
    cta: 'Order Chinese',
    ctaLink: '/menu?cat=chinese',
    color1: '#4ECDC4',
    color2: '#A8E6CF',
    emoji: '🍜',
    bg: 'radial-gradient(ellipse at 70% 50%, rgba(78,205,196,0.18) 0%, transparent 70%)',
    image: '/images/food-spread.png',
  },
  {
    tag: '👑 Premium',
    title: 'Luxury\nDining',
    subtitle: 'Truffle Risotto, Grilled Steak, Prawn Butter Garlic — fine dining delivered.',
    cta: 'Explore Luxury',
    ctaLink: '/menu?cat=luxury',
    color1: '#CDB4DB',
    color2: '#A2D2FF',
    emoji: '👑',
    bg: 'radial-gradient(ellipse at 70% 50%, rgba(205,180,219,0.15) 0%, transparent 70%)',
    image: '/images/food-spread.png',
  },
];

// Reveal wrapper (no hooks in callbacks)
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

// Single hero slide
function HeroSlide({ slide, active }: { slide: typeof SLIDES[0]; active: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          key={slide.title}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center"
        >
          {/* Bg gradient blob */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: slide.bg }} />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: `${slide.color1}18`, border: `1px solid ${slide.color1}33` }}>
                <Flame className="w-4 h-4" style={{ color: slide.color1 }} />
                <span className="text-sm font-bold" style={{ color: slide.color1 }}>{slide.tag}</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="section-title text-6xl sm:text-7xl lg:text-8xl leading-none mb-6 whitespace-pre-line"
                style={{
                  background: `linear-gradient(135deg, ${slide.color1}, ${slide.color2})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                {slide.title}
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="text-lg mb-8 max-w-md leading-relaxed" style={{ color: 'rgba(250,250,250,0.65)' }}>
                {slide.subtitle}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="flex flex-wrap gap-4">
                <Link href={slide.ctaLink} className="btn-primary text-base px-8 py-4"
                  style={{ background: `linear-gradient(135deg, ${slide.color1}, ${slide.color2})` }}>
                  {slide.cta} →
                </Link>
                <Link href="/menu" className="btn-secondary text-base px-8 py-4"
                  style={{ borderColor: `${slide.color1}55`, color: slide.color1 }}>
                  View Menu
                </Link>
              </motion.div>

              {/* Mini stats */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex gap-6 mt-10">
                {[
                  { val: '4.9★', label: 'Rating' },
                  { val: '30 min', label: 'Delivery' },
                  { val: '60+', label: 'Dishes' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="font-black text-xl" style={{ color: slide.color1 }}>{s.val}</p>
                    <p className="text-xs" style={{ color: 'rgba(250,250,250,0.4)' }}>{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Floating food image */}
            <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex items-center justify-center relative">
              <motion.div
                animate={{ y: [0, -18, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-80 h-80 rounded-3xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${slide.color1}22, ${slide.color2}22)`,
                  border: `1px solid ${slide.color1}30`,
                  boxShadow: `0 40px 100px ${slide.color1}30`,
                }}>
                <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                {/* Floating emoji badge */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${slide.color1}, ${slide.color2})` }}>
                  {slide.emoji}
                </motion.div>
              </motion.div>
              {/* Glow */}
              <div className="absolute inset-0 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ background: slide.color1 }} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hero section with slider
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [search, setSearch] = useState('');
  const total = SLIDES.length;

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '100vh', paddingTop: '80px', background: '#07060f' }}>
      {/* Fixed dark bg */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(255,107,107,0.06) 0%, transparent 60%)' }} />

      {/* Slides */}
      <div className="absolute inset-0" style={{ paddingTop: '80px' }}>
        {SLIDES.map((s, i) => <HeroSlide key={i} slide={s} active={i === current} />)}
      </div>

      {/* Search bar overlay at bottom */}
      <div className="absolute bottom-16 left-0 right-0 z-20 px-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(250,250,250,0.3)' }} />
            <input id="hero-search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search momos, pizza, noodles..."
              onKeyDown={e => { if (e.key === 'Enter') window.location.href = `/menu?q=${search}`; }}
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm outline-none"
              style={{ background: 'rgba(7,6,15,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#FAFAFA', backdropFilter: 'blur(12px)' }} />
          </div>
          <Link href={`/menu${search ? `?q=${search}` : ''}`} className="btn-primary px-6 shrink-0 rounded-2xl">Search</Link>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        <button onClick={prev} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-4 h-4" style={{ color: 'rgba(250,250,250,0.5)' }} />
        </button>
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <motion.button key={i} onClick={() => setCurrent(i)}
              animate={{ width: i === current ? 24 : 8, opacity: i === current ? 1 : 0.4 }}
              className="h-2 rounded-full"
              style={{ background: i === current ? SLIDES[current].color1 : 'rgba(250,250,250,0.3)' }} />
          ))}
        </div>
        <button onClick={next} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronRight className="w-4 h-4" style={{ color: 'rgba(250,250,250,0.5)' }} />
        </button>
      </div>
    </section>
  );
}

// Category grid
const HERO_CATS = [
  { label: 'Momos', emoji: '🥟', cat: 'steam', color: '#FF6B6B' },
  { label: 'Pizza', emoji: '🍕', cat: 'pizza', color: '#FF8E53' },
  { label: 'Chinese', emoji: '🍜', cat: 'chinese', color: '#FFC857' },
  { label: 'Pasta', emoji: '🍝', cat: 'pasta', color: '#4ECDC4' },
  { label: 'Burgers', emoji: '🍔', cat: 'fastfood', color: '#A8E6CF' },
  { label: 'Healthy', emoji: '🥗', cat: 'healthy', color: '#6BCB77' },
  { label: 'Luxury', emoji: '👑', cat: 'luxury', color: '#CDB4DB' },
  { label: 'Asian', emoji: '🌏', cat: 'asian', color: '#BDE0FE' },
];

const OFFERS = [
  { title: '50% OFF', sub: 'Up to ₹100 on first order', code: 'NEW50', grad: 'linear-gradient(135deg,#FF6B6B,#FF4E4E)', emoji: '🎉' },
  { title: 'Free Delivery', sub: `On orders above ₹${SHOP_INFO.freeDeliveryAbove}`, code: 'FREEDEL', grad: 'linear-gradient(135deg,#4ECDC4,#44A08D)', emoji: '🛵' },
  { title: '2× Reward', sub: 'Every weekend order', code: 'WEEKEND', grad: 'linear-gradient(135deg,#FFC857,#F7971E)', emoji: '⭐' },
];

// Product card (no hooks in map — standalone component)
function ProductCard({ product }: { product: typeof PRODUCTS[0] }) {
  const { addItem, items } = useCart();
  const qty = items.find(i => i.product.id === product.id)?.quantity || 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="food-card group"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80'; }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(7,6,15,0.7) 0%, transparent 60%)' }} />
        {product.badge && (
          <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,107,107,0.9)', color: '#fff' }}>{product.badge}</span>
        )}
        <span className={`absolute top-2 right-2 ${product.isVeg ? 'veg-dot' : 'nonveg-dot'}`} />
      </div>
      <div className="p-4">
        <p className="font-bold text-sm leading-snug mb-1 truncate" style={{ color: '#FAFAFA' }}>{product.name}</p>
        <p className="text-xs mb-3" style={{ color: 'rgba(250,250,250,0.4)' }}>{product.servings}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-black" style={{ color: '#FAFAFA' }}>₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs line-through ml-1.5" style={{ color: 'rgba(250,250,250,0.3)' }}>₹{product.originalPrice}</span>
            )}
          </div>
          {qty === 0 ? (
            <motion.button onClick={() => addItem(product)} className="add-btn px-3"
              whileTap={{ scale: 0.9 }}>ADD +</motion.button>
          ) : (
            <HomeQtyCounter product={product} qty={qty} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Separate component so hooks aren't called inside a map callback
function HomeQtyCounter({ product, qty }: { product: typeof PRODUCTS[0]; qty: number }) {
  const { addItem, updateQuantity, removeItem } = useCart();
  return (
    <div className="qty-counter">
      <button onClick={() => qty > 1 ? updateQuantity(product.id, qty - 1) : removeItem(product.id)}>−</button>
      <span>{qty}</span>
      <button onClick={() => addItem(product)}>+</button>
    </div>
  );
}

export default function HomePage() {
  const featured = PRODUCTS.filter(p => p.featured).slice(0, 8);

  return (
    <div style={{ background: '#07060f', position: 'relative', overflowX: 'hidden' }}>
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />
      <ScrollProgressBar />
      <ScrollToTop />

      {/* ── Slider Hero ── */}
      <HeroSlider />

      {/* ── Marquee ── */}
      <div className="overflow-hidden py-4" style={{ background: 'rgba(255,107,107,0.05)', borderTop: '1px solid rgba(255,107,107,0.1)', borderBottom: '1px solid rgba(255,107,107,0.1)' }}>
        <motion.div className="flex gap-12 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
          {[...Array(2)].flatMap((_, a) =>
            ['🥟 Momos', '🍕 Pizza', '🍜 Chinese', '🍝 Pasta', '🍔 Burgers', '🥗 Healthy', '👑 Luxury', '🛵 30 min delivery', '⭐ 4.9 Stars', '🎉 Code NEW50'].map((t, i) => (
              <span key={`${a}-${i}`} className="text-sm font-semibold shrink-0" style={{ color: 'rgba(250,250,250,0.4)' }}>{t}</span>
            ))
          )}
        </motion.div>
      </div>

      {/* ── Modern Bento Grid Categories ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-10 text-center">
            <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-300 to-red-500 mb-2">Explore the Menu</h2>
            <p className="text-sm" style={{ color: 'rgba(250,250,250,0.4)' }}>What are you craving today?</p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[160px]">
            {/* Large Bento Box */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="col-span-2 row-span-2 rounded-[2rem] overflow-hidden relative group cursor-pointer border border-white/5"
              style={{ background: 'linear-gradient(135deg, rgba(231,76,60,0.1) 0%, rgba(192,57,43,0.3) 100%)' }}>
              <Link href="/menu?cat=momos" className="block w-full h-full p-8 flex flex-col justify-end relative z-10 block">
                <span className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-500 origin-bottom-left">🥟</span>
                <h3 className="text-3xl font-black text-white leading-tight mb-2">Legendary<br/>Momos</h3>
                <p className="text-white/60 font-medium">Steam, Fried & Kurkure</p>
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  <ChevronRight className="text-white" />
                </div>
              </Link>
            </motion.div>

            {/* Medium horizontal */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="col-span-2 row-span-1 rounded-[2rem] overflow-hidden relative group cursor-pointer border border-white/5"
              style={{ background: 'linear-gradient(135deg, rgba(243,156,18,0.1) 0%, rgba(211,84,0,0.3) 100%)' }}>
              <Link href="/menu?cat=pizza" className="block w-full h-full p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white mb-1">Wood-Fired Pizza</h3>
                  <p className="text-white/60 text-sm font-medium">Cheesy & Crispy crust</p>
                </div>
                <span className="text-6xl group-hover:rotate-12 transition-transform duration-500">🍕</span>
              </Link>
            </motion.div>

            {/* Small box 1 */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="col-span-1 row-span-1 rounded-[2rem] overflow-hidden relative group cursor-pointer border border-white/5"
              style={{ background: 'linear-gradient(135deg, rgba(46,204,113,0.1) 0%, rgba(39,174,96,0.2) 100%)' }}>
              <Link href="/menu?cat=healthy" className="block w-full h-full p-6 flex flex-col justify-center items-center text-center">
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🥗</span>
                <h3 className="text-sm font-black text-white">Healthy Meals</h3>
              </Link>
            </motion.div>

            {/* Small box 2 */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="col-span-1 row-span-1 rounded-[2rem] overflow-hidden relative group cursor-pointer border border-white/5"
              style={{ background: 'linear-gradient(135deg, rgba(52,152,219,0.1) 0%, rgba(41,128,185,0.2) 100%)' }}>
              <Link href="/menu?cat=drinks" className="block w-full h-full p-6 flex flex-col justify-center items-center text-center">
                <span className="text-4xl mb-2 group-hover:-rotate-12 transition-transform">🥤</span>
                <h3 className="text-sm font-black text-white">Cold Drinks</h3>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Offers ── */}
      <section className="pb-4 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-2xl font-black mb-6" style={{ color: '#FAFAFA' }}>🔥 Best Offers Today</h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-4">
            {OFFERS.map((o, i) => (
              <Reveal key={o.code} delay={i * 0.1}>
                <motion.div className="offer-banner cursor-pointer" style={{ background: o.grad }}
                  whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-black text-white">{o.title}</p>
                      <p className="text-sm text-white/75 mt-1">{o.sub}</p>
                      <code className="mt-3 inline-block px-3 py-1 rounded-full text-white text-xs font-bold"
                        style={{ background: 'rgba(255,255,255,0.18)' }}>{o.code}</code>
                    </div>
                    <span className="text-5xl">{o.emoji}</span>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Now  ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black" style={{ color: '#FAFAFA' }}>⭐ Popular Right Now</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(250,250,250,0.4)' }}>Most ordered today</p>
            </div>
            <Link href="/menu" className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#FF6B6B' }}>
              Full menu <ChevronRight className="w-4 h-4" />
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── Stats counters ── */}
      <section className="py-16 px-4" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-10">
            <h2 className="text-2xl font-black" style={{ color: '#FAFAFA' }}>We deliver happiness 😊</h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <AnimatedCounter target={2000} suffix="+" label="Happy Orders" color="#FF6B6B" />
            <AnimatedCounter target={500} suffix="+" label="5-Star Reviews" color="#FFC857" />
            <AnimatedCounter target={30} suffix=" min" label="Avg Delivery" color="#4ECDC4" />
            <AnimatedCounter target={60} suffix="+" label="Dishes" color="#A8E6CF" />
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-8">
            <h2 className="text-2xl font-black" style={{ color: '#FAFAFA' }}>💬 Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-yellow-400">★★★★★</span>
              <span className="text-sm" style={{ color: 'rgba(250,250,250,0.5)' }}>4.9 / 5 — 500+ reviews</span>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.08}>
                <motion.div className="p-5 rounded-2xl h-full flex flex-col gap-3"
                  style={{ background: '#0f0e1a', border: '1px solid rgba(255,255,255,0.05)' }}
                  whileHover={{ borderColor: 'rgba(255,107,107,0.25)', y: -4 }}>
                  <div className="flex text-yellow-400 text-sm">{'★'.repeat(r.rating)}</div>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(250,250,250,0.65)' }}>"{r.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)' }}>{r.avatar}</div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#FAFAFA' }}>{r.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(250,250,250,0.3)' }}>{r.date}</p>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-14 px-4" style={{ background: '#05040b', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-10">
          <div>
            <p className="font-black text-xl gradient-text mb-3">Meghna's Kitchen 🥟</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(250,250,250,0.4)' }}>
              Crafted with Heart. Packed with Flavor. 60+ dishes delivered in 30 min.
            </p>
          </div>
          <div>
            <p className="font-bold text-sm mb-4" style={{ color: '#FAFAFA' }}>Quick Links</p>
            <div className="space-y-2">
              {[['/', 'Home'], ['/menu', 'Menu'], ['/about', 'About'], ['/contact', 'Contact']].map(([h, l]) => (
                <Link key={h} href={h} className="block text-sm transition-colors hover:text-orange-400" style={{ color: 'rgba(250,250,250,0.45)' }}>{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-bold text-sm mb-4" style={{ color: '#FAFAFA' }}>Contact</p>
            <p className="text-sm mb-1" style={{ color: 'rgba(250,250,250,0.45)' }}>{SHOP_INFO.phone}</p>
            <p className="text-sm mb-1" style={{ color: 'rgba(250,250,250,0.45)' }}>{SHOP_INFO.address}</p>
            <p className="text-sm mb-3" style={{ color: 'rgba(250,250,250,0.45)' }}>{SHOP_INFO.openTime} – {SHOP_INFO.closeTime}</p>
            <a href={`https://wa.me/${SHOP_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
              style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366', border: '1px solid rgba(37,211,102,0.25)' }}>
              📱 Order on WhatsApp
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 text-center text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(250,250,250,0.2)' }}>
          © 2026 Meghna's Kitchen. Made with ❤️ for food lovers.
        </div>
      </footer>
    </div>
  );
}
