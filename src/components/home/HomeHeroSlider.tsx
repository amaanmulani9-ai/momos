'use client';

import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Search } from 'lucide-react';

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

function HeroSlide({ slide, active }: { slide: (typeof SLIDES)[number]; active: boolean }) {
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
          <div className="absolute inset-0 pointer-events-none" style={{ background: slide.bg }} />

          <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
                style={{ background: `${slide.color1}18`, border: `1px solid ${slide.color1}33` }}
              >
                <Flame className="h-4 w-4" style={{ color: slide.color1 }} />
                <span className="text-sm font-bold" style={{ color: slide.color1 }}>{slide.tag}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="section-title mb-6 whitespace-pre-line text-6xl leading-none sm:text-7xl lg:text-8xl"
                style={{
                  background: `linear-gradient(135deg, ${slide.color1}, ${slide.color2})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {slide.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mb-8 max-w-md text-lg leading-relaxed"
                style={{ color: 'rgba(250,250,250,0.65)' }}
              >
                {slide.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href={slide.ctaLink}
                  className="btn-primary px-8 py-4 text-base"
                  style={{ background: `linear-gradient(135deg, ${slide.color1}, ${slide.color2})` }}
                >
                  {slide.cta} →
                </Link>
                <Link
                  href="/menu"
                  className="btn-secondary px-8 py-4 text-base"
                  style={{ borderColor: `${slide.color1}55`, color: slide.color1 }}
                >
                  View Menu
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-10 flex gap-6"
              >
                {[
                  { val: '4.9★', label: 'Rating' },
                  { val: '30 min', label: 'Delivery' },
                  { val: '60+', label: 'Dishes' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-black" style={{ color: slide.color1 }}>{stat.val}</p>
                    <p className="text-xs" style={{ color: 'rgba(250,250,250,0.4)' }}>{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              <ScrollCue color1={slide.color1} color2={slide.color2} />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden items-center justify-center lg:flex"
            >
              <motion.div
                animate={{ y: [0, -18, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative h-80 w-80 overflow-hidden rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, ${slide.color1}22, ${slide.color2}22)`,
                  border: `1px solid ${slide.color1}30`,
                  boxShadow: `0 40px 100px ${slide.color1}30`,
                }}
              >
                <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${slide.color1}, ${slide.color2})` }}
                >
                  {slide.emoji}
                </motion.div>
              </motion.div>

              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ background: slide.color1 }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ScrollCue({ color1, color2 }: { color1: string; color2: string }) {
  return (
    <motion.button
      type="button"
      onClick={() => window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' })}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.45 }}
      whileHover={{ y: -2 }}
      className="mt-8 inline-flex items-center gap-3 rounded-full px-4 py-3 text-left"
      style={{
        background: 'rgba(7,6,15,0.58)',
        border: `1px solid ${color1}33`,
        backdropFilter: 'blur(12px)',
      }}
      aria-label="Scroll to explore more"
    >
      <span
        className="relative flex h-12 w-7 items-start justify-center rounded-full"
        style={{
          border: `1px solid ${color1}80`,
          background: 'rgba(255,255,255,0.03)',
          boxShadow: `inset 0 0 0 1px ${color1}15`,
        }}
      >
        <motion.span
          animate={{ y: [6, 24, 6], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
          className="h-2.5 w-1.5 rounded-full"
          style={{
            marginTop: '0.45rem',
            background: `linear-gradient(180deg, ${color2}, ${color1})`,
          }}
        />
      </span>

      <span className="flex flex-col">
        <span
          className="text-[0.68rem] font-semibold uppercase tracking-[0.28em]"
          style={{ color: 'rgba(250,250,250,0.45)' }}
        >
          Scroll
        </span>
        <span className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
          Explore more
        </span>
      </span>
    </motion.button>
  );
}

export default function HomeHeroSlider() {
  const [current, setCurrent] = useState(0);
  const [search, setSearch] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const total = SLIDES.length;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const overlayY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((value) => (value + 1) % total), 5000);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ minHeight: '100vh', paddingTop: '80px', background: '#07060f' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(255,107,107,0.06) 0%, transparent 60%)' }}
      />

      <motion.div className="absolute inset-0 pt-20" style={{ y: heroY, opacity: heroOpacity }}>
        {SLIDES.map((slide, index) => (
          <HeroSlide key={slide.title} slide={slide} active={index === current} />
        ))}
      </motion.div>

      <motion.div className="absolute bottom-16 left-0 right-0 z-20 px-4" style={{ y: overlayY, opacity: heroOpacity }}>
        <div className="mx-auto flex max-w-2xl gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'rgba(250,250,250,0.3)' }} />
            <input
              id="hero-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search momos, pizza, noodles..."
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  window.location.href = `/menu?q=${search}`;
                }
              }}
              className="w-full rounded-2xl py-4 pl-12 pr-4 text-sm outline-none"
              style={{
                background: 'rgba(7,6,15,0.8)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#FAFAFA',
                backdropFilter: 'blur(12px)',
              }}
            />
          </div>
          <Link href={`/menu${search ? `?q=${search}` : ''}`} className="btn-primary shrink-0 rounded-2xl px-6">
            Search
          </Link>
        </div>
      </motion.div>

      <motion.div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4" style={{ y: overlayY, opacity: heroOpacity }}>
        <button
          onClick={() => setCurrent((value) => (value - 1 + total) % total)}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" style={{ color: 'rgba(250,250,250,0.5)' }} />
        </button>

        <div className="flex gap-2">
          {SLIDES.map((slide, index) => (
            <motion.button
              key={slide.title}
              onClick={() => setCurrent(index)}
              animate={{ width: index === current ? 24 : 8, opacity: index === current ? 1 : 0.4 }}
              className="h-2 rounded-full"
              style={{ background: index === current ? SLIDES[current].color1 : 'rgba(250,250,250,0.3)' }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrent((value) => (value + 1) % total)}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="h-4 w-4" style={{ color: 'rgba(250,250,250,0.5)' }} />
        </button>
      </motion.div>
    </section>
  );
}
