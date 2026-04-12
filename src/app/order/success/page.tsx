'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'motion/react';
import Link from 'next/link';
import { CheckCircle, Clock, MapPin, Phone, ChevronDown, ChevronUp, Share2, Star, RotateCcw, MessageCircle, Bike } from 'lucide-react';
import { SHOP_INFO } from '@/lib/data';

// ── Order status stages ──
const STAGES = [
  { id: 'confirmed', label: 'Order Confirmed', sub: 'Restaurant accepted your order', icon: '✅', color: '#6BCB77' },
  { id: 'preparing', label: 'Preparing your food', sub: 'Chef is cooking your order', icon: '👨‍🍳', color: '#FFC857' },
  { id: 'pickup',    label: 'Out for Delivery', sub: 'Rider picked up your order', icon: '🛵', color: '#4ECDC4' },
  { id: 'delivered', label: 'Delivered!', sub: 'Enjoy your meal 😊', icon: '🎉', color: '#FF6B6B' },
];

// ── Fake delivery agent ──
const AGENTS = [
  { name: 'Ravi Kumar', rating: '4.8', phone: `tel:${SHOP_INFO.phone}`, vehicle: 'Honda Activa • UP 81 AT 2234' },
  { name: 'Priya Sharma', rating: '4.9', phone: `tel:${SHOP_INFO.phone}`, vehicle: 'Hero Splendor • UP 16 BT 8821' },
  { name: 'Suresh Yadav', rating: '4.7', phone: `tel:${SHOP_INFO.phone}`, vehicle: 'TVS Jupiter • UP 65 DK 0043' },
];

// ── Animated delivery map (SVG-based) ──
function DeliveryMap({ progress }: { progress: number }) {
  // SVG path from restaurant to user
  const pathRef = useRef<SVGPathElement>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: 220, background: '#0f0e28' }}>
      {/* Grid lines */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-20">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#4ECDC4" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Road path */}
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Main road */}
        <path d="M 60 185 Q 150 120 240 140 Q 330 160 420 90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="20" strokeLinecap="round"/>
        <path d="M 60 185 Q 150 120 240 140 Q 330 160 420 90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 8"/>
        {/* Cross road */}
        <path d="M 200 220 L 200 60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14"/>
        <path d="M 350 220 L 350 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
        <path d="M 0 130 L 480 130" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12"/>

        {/* Progress route highlight */}
        <motion.path
          ref={pathRef}
          d="M 60 185 Q 150 120 240 140 Q 330 160 420 90"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#4ECDC4" />
          </linearGradient>
        </defs>

        {/* Restaurant pin */}
        <g transform="translate(50,185)">
          <circle r="10" fill="#FF6B6B" opacity="0.2"/>
          <circle r="6" fill="#FF6B6B"/>
          <text x="-4" y="4" fontSize="7" fill="white">🍳</text>
        </g>

        {/* Customer pin */}
        <g transform="translate(420,90)">
          <circle r="10" fill="#4ECDC4" opacity="0.2"/>
          <circle r="6" fill="#4ECDC4"/>
          <text x="-4" y="4" fontSize="7" fill="white">🏠</text>
        </g>
      </svg>

      {/* Moving rider (interpolated along path) */}
      <motion.div
        className="absolute z-10 text-2xl"
        style={{ filter: 'drop-shadow(0 0 8px rgba(255,200,87,0.8))' }}
        animate={{
          left: `${10 + (progress / 100) * 80}%`,
          top:  `${85 - Math.sin((progress / 100) * Math.PI) * 40}%`,
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        🛵
      </motion.div>

      {/* Labels */}
      <div className="absolute bottom-2 left-3 text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(255,107,107,0.2)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.3)' }}>
        📍 Restaurant
      </div>
      <div className="absolute top-2 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(78,205,196,0.2)', color: '#4ECDC4', border: '1px solid rgba(78,205,196,0.3)' }}>
        🏠 Your Location
      </div>

      {/* ETA badge */}
      <div className="absolute bottom-2 right-3 text-xs font-bold px-2 py-1 rounded-full"
        style={{ background: 'rgba(255,200,87,0.15)', color: '#FFC857', border: '1px solid rgba(255,200,87,0.3)' }}>
        ⏱ Live Tracking
      </div>
    </div>
  );
}

// ── ETA countdown ──
function ETATimer({ totalSeconds }: { totalSeconds: number }) {
  const [secs, setSecs] = useState(totalSeconds);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5" style={{ color: '#FFC857' }} />
      <div>
        <p className="text-xs font-semibold" style={{ color: 'rgba(250,250,250,0.5)' }}>Estimated Arrival</p>
        <p className="text-2xl font-black" style={{ color: '#FFC857' }}>
          {mins}:{s.toString().padStart(2, '0')} <span className="text-sm font-normal" style={{ color: 'rgba(250,250,250,0.4)' }}>min</span>
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  const [stageIdx, setStageIdx] = useState(0);
  const [agent] = useState(() => AGENTS[Math.floor(Math.random() * AGENTS.length)]);
  const [orderId] = useState(() => 'MK' + Date.now().toString().slice(-6));
  const [orderData, setOrderData] = useState<{
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number; deliveryFee: number; total: number;
    name?: string; address?: string; payment?: string;
  } | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [rated, setRated] = useState(0);
  const etaSeconds = 35 * 60; // 35 min

  // Auto-advance stages
  useEffect(() => {
    const timings = [0, 8000, 20000, 35000]; // ms delays
    const timers = timings.map((t, i) => setTimeout(() => setStageIdx(i), t));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Load saved order
  useEffect(() => {
    const saved = sessionStorage.getItem('lastOrder');
    if (saved) { try { setOrderData(JSON.parse(saved)); } catch {} }
  }, []);

  const currentStage = STAGES[stageIdx];
  const mapProgress = [5, 35, 70, 100][stageIdx];
  const displayItems = orderData?.items || [];
  const displayTotal = orderData?.total || 0;

  function handleShare() {
    const text = `I just ordered from Meghna's Kitchen! 🥟🍕\nOrder #${orderId} | ₹${displayTotal}`;
    if (navigator.share) navigator.share({ title: "My Order", text, url: window.location.href });
    else navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#07060f' }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(7,6,15,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-3">
          <motion.div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)' }}
            animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Bike className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <p className="font-black text-sm" style={{ color: '#FAFAFA' }}>Order #{orderId}</p>
            <p className="text-xs" style={{ color: currentStage.color }}>{currentStage.label}</p>
          </div>
        </div>
        <button onClick={handleShare} className="p-2 rounded-xl transition-colors hover:bg-white/10">
          <Share2 className="w-4 h-4" style={{ color: 'rgba(250,250,250,0.5)' }} />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ── ETA + Status chip ── */}
        <motion.div
          layout
          className="p-4 rounded-2xl flex items-center justify-between"
          style={{ background: '#0f0e1a', border: `1px solid ${currentStage.color}30` }}>
          <ETATimer totalSeconds={Math.max(etaSeconds - stageIdx * 600, 60)} />
          <motion.div
            key={stageIdx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl float-animation">
            {currentStage.icon}
          </motion.div>
        </motion.div>

        {/* ── Live Map ── */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <DeliveryMap progress={mapProgress} />
        </div>

        {/* ── Status Timeline ── */}
        <div className="p-5 rounded-2xl" style={{ background: '#0f0e1a', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-bold mb-5" style={{ color: '#FAFAFA' }}>Order Status</p>
          <div className="space-y-0">
            {STAGES.map((stage, i) => {
              const done = i <= stageIdx;
              const active = i === stageIdx;
              return (
                <div key={stage.id} className="flex gap-4 last:pb-0 pb-5 relative">
                  {/* Connector line */}
                  {i < STAGES.length - 1 && (
                    <div className="absolute left-[19px] top-9 w-0.5 h-full"
                      style={{ background: done ? stage.color : 'rgba(255,255,255,0.1)' }} />
                  )}
                  {/* Icon circle */}
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 relative z-10"
                    style={{
                      background: done ? `${stage.color}20` : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${done ? stage.color : 'rgba(255,255,255,0.1)'}`,
                    }}
                    animate={active ? { scale: [1, 1.1, 1], boxShadow: [`0 0 0 0 ${stage.color}40`, `0 0 0 8px ${stage.color}00`] } : {}}
                    transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}>
                    {done ? stage.icon : '○'}
                  </motion.div>
                  {/* Text */}
                  <div className="pt-1 flex-1">
                    <p className="text-sm font-bold" style={{ color: done ? '#FAFAFA' : 'rgba(250,250,250,0.3)' }}>{stage.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: done ? 'rgba(250,250,250,0.5)' : 'rgba(250,250,250,0.2)' }}>{stage.sub}</p>
                    {active && (
                      <motion.div className="flex gap-1 mt-2">
                        {[0,1,2].map(d => (
                          <motion.div key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: stage.color }}
                            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.3 }} />
                        ))}
                      </motion.div>
                    )}
                  </div>
                  {done && !active && (
                    <CheckCircle className="w-4 h-4 mt-2 shrink-0" style={{ color: stage.color }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Delivery Agent ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: stageIdx >= 2 ? 1 : 0, y: stageIdx >= 2 ? 0 : 20 }}
          className="p-4 rounded-2xl" style={{ background: '#0f0e1a', border: '1px solid rgba(78,205,196,0.2)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(250,250,250,0.4)' }}>Delivery Partner</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: 'linear-gradient(135deg,#FF6B6B22,#FF8E5322)', border: '1px solid rgba(255,107,107,0.2)' }}>
              🧑‍✈️
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-base" style={{ color: '#FAFAFA' }}>{agent.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold" style={{ color: '#FFC857' }}>{agent.rating}</span>
                <span className="text-xs mx-1" style={{ color: 'rgba(250,250,250,0.2)' }}>·</span>
                <span className="text-xs truncate" style={{ color: 'rgba(250,250,250,0.5)' }}>{agent.vehicle}</span>
              </div>
            </div>
            <a href={SHOP_INFO.phone} className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all hover:scale-110"
              style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)' }}>
              <Phone className="w-4 h-4" style={{ color: '#25D366' }} />
            </a>
          </div>
          {/* Live location text */}
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(78,205,196,0.06)', border: '1px solid rgba(78,205,196,0.12)' }}>
            <motion.div className="w-2 h-2 rounded-full bg-green-400 shrink-0" animate={{ opacity: [1,0,1] }} transition={{ duration: 1, repeat: Infinity }} />
            <p className="text-xs" style={{ color: 'rgba(250,250,250,0.5)' }}>
              {['Heading to the restaurant...', 'Picked up your order! En route...', `${Math.floor(Math.random() * 3) + 1} km away from you`][Math.min(stageIdx - 1, 2)] || 'Locating rider...'}
            </p>
          </div>
        </motion.div>

        {/* ── Order Receipt (collapsible) ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0f0e1a', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setReceiptOpen(!receiptOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧾</span>
              <p className="font-bold text-sm" style={{ color: '#FAFAFA' }}>Order Receipt</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B' }}>
                ₹{displayTotal}
              </span>
            </div>
            {receiptOpen ? <ChevronUp className="w-4 h-4" style={{ color: 'rgba(250,250,250,0.4)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'rgba(250,250,250,0.4)' }} />}
          </button>

          <AnimatePresence>
            {receiptOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden">
                <div className="px-4 pb-4 space-y-3">
                  <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                  {/* Restaurant + delivery info */}
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-xs font-semibold" style={{ color: 'rgba(250,250,250,0.4)' }}>FROM</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: '#FAFAFA' }}>Meghna's Kitchen</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(250,250,250,0.4)' }}>Sector 18, Noida</p>
                    </div>
                    {orderData?.address && (
                      <div className="flex-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-xs font-semibold" style={{ color: 'rgba(250,250,250,0.4)' }}>TO</p>
                        <p className="text-sm font-bold mt-0.5" style={{ color: '#FAFAFA' }}>{orderData.name || 'You'}</p>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'rgba(250,250,250,0.4)' }}>{orderData.address}</p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {displayItems.length > 0 && (
                    <div className="space-y-2">
                      {displayItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(255,107,107,0.15)', color: '#FF6B6B' }}>{item.quantity}</span>
                            <span className="text-sm" style={{ color: 'rgba(250,250,250,0.8)' }}>{item.name}</span>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pricing breakdown */}
                  <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex justify-between text-xs" style={{ color: 'rgba(250,250,250,0.5)' }}>
                      <span>Item Total</span><span>₹{orderData?.subtotal || displayTotal}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: 'rgba(250,250,250,0.5)' }}>
                      <span>Delivery Fee</span>
                      <span>{(orderData?.deliveryFee || 0) === 0 ? <span style={{ color: '#6BCB77' }}>FREE 🎉</span> : `₹${orderData?.deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: 'rgba(250,250,250,0.5)' }}>
                      <span>Taxes & Charges</span><span>included</span>
                    </div>
                    <div className="flex justify-between font-black text-base pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#FAFAFA' }}>
                      <span>Total Paid</span>
                      <span style={{ background: 'linear-gradient(135deg,#FFC857,#FF8E53)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        ₹{displayTotal}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg" style={{ background: 'rgba(107,203,119,0.08)', border: '1px solid rgba(107,203,119,0.15)' }}>
                      <span className="text-xs" style={{ color: '#6BCB77' }}>💳 Payment: {orderData?.payment || 'Cash on Delivery'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Rate your order (shown after delivery) ── */}
        <AnimatePresence>
          {stageIdx === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl text-center" style={{ background: '#0f0e1a', border: '1px solid rgba(255,200,87,0.2)' }}>
              <p className="font-black text-base mb-1" style={{ color: '#FAFAFA' }}>How was your experience? 🌟</p>
              <p className="text-xs mb-4" style={{ color: 'rgba(250,250,250,0.4)' }}>Rate your delivery experience</p>
              <div className="flex justify-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <motion.button key={s} onClick={() => setRated(s)}
                    whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    className="text-3xl transition-all"
                    style={{ filter: s <= rated ? 'none' : 'grayscale(1)', opacity: s <= rated ? 1 : 0.4 }}>
                    ⭐
                  </motion.button>
                ))}
              </div>
              {rated > 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-semibold" style={{ color: '#FFC857' }}>
                  {['', 'Could be better 😕', 'It was okay 😐', 'Good! 😊', 'Really liked it! 😍', 'Absolutely loved it! 🤩'][rated]}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Actions ── */}
        <div className="grid grid-cols-2 gap-3">
          <a href={`https://wa.me/${SHOP_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-105"
            style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366', border: '1px solid rgba(37,211,102,0.25)' }}>
            <MessageCircle className="w-4 h-4" /> Track on WhatsApp
          </a>
          <Link href="/menu"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm btn-primary">
            <RotateCcw className="w-4 h-4" /> Reorder
          </Link>
        </div>

        {/* ── Delivery address ── */}
        <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: '#0f0e1a', border: '1px solid rgba(255,255,255,0.05)' }}>
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FF6B6B' }} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(250,250,250,0.4)' }}>Delivering To</p>
            <p className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{orderData?.name || 'Your Location'}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(250,250,250,0.5)' }}>{orderData?.address || 'Sector 18, Noida, UP 201301'}</p>
          </div>
        </div>

        <Link href="/" className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-colors"
          style={{ color: 'rgba(250,250,250,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}
