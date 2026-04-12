'use client';

import { useScroll, useSpring, useTransform, motion, AnimatePresence, useInView } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** ── Top scroll progress bar ── */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: '0%',
        background: 'linear-gradient(90deg, #FF6B6B, #FFC857, #4ECDC4)',
        height: 3,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    />
  );
}

/** ── Scroll-to-top button ── */
export function ScrollToTop() {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    return scrollYProgress.on('change', v => setVisible(v > 0.1));
  }, [scrollYProgress]);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 left-5 z-40 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
            boxShadow: '0 0 20px rgba(255,107,107,0.4)',
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** ── Fade-up on scroll reveal ── */
export function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** ── Stagger children on scroll ── */
export function StaggerReveal({
  children,
  className = '',
  staggerDelay = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChild({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** ── Parallax wrapper ── */
export function Parallax({
  children,
  speed = 0.3,
  className = '',
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-60 * speed * 10, 60 * speed * 10]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y: smoothY }}>{children}</motion.div>
    </div>
  );
}

/** ── Animated number counter (standalone component — no hooks in map) ── */
export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 1.5,
  color = '#FF6B6B',
  label = '',
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  color?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration * 60);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isInView, target, duration]);

  return (
    <div ref={ref} className="text-center p-6 rounded-2xl" style={{ background: '#0f0e1a', border: `1px solid ${color}22` }}>
      <p className="text-4xl font-black mb-1" style={{ color }}>
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      {label && <p className="text-sm" style={{ color: 'rgba(250,250,250,0.5)' }}>{label}</p>}
    </div>
  );
}

/** ── Horizontal scroll marquee ── */
export function ScrollMarquee({ items }: { items: string[] }) {
  return (
    <div
      className="overflow-hidden py-3"
      style={{
        background: 'rgba(255,107,107,0.06)',
        borderTop: '1px solid rgba(255,107,107,0.1)',
        borderBottom: '1px solid rgba(255,107,107,0.1)',
      }}
    >
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-sm font-semibold shrink-0" style={{ color: 'rgba(250,250,250,0.4)' }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
