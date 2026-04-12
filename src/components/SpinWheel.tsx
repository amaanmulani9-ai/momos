'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '@/lib/store';

const SEGMENTS = [
  { label: '₹50 OFF', color: '#FF6B6B', value: 'FLAT50' },
  { label: 'TRY AGAIN', color: '#8e44ad', value: '' },
  { label: 'FREE CHAI', color: '#f39c12', value: 'FREECHAI' },
  { label: '10% OFF', color: '#4ECDC4', value: 'NEW10' },
  { label: 'BAD LUCK', color: '#34495e', value: '' },
  { label: 'FREE MOMOS', color: '#2ecc71', value: 'FREEMOMOS' }
];

export default function SpinWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prize, setPrize] = useState('');
  const { applyCouponCode } = useCart();
  
  // Has the user spun today?
  const hasSpun = typeof window !== 'undefined' ? localStorage.getItem('hasSpun') : null;

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setPrize('');
    
    // Always let them win something nice if they haven't won
    const targetSegment = Math.random() > 0.5 ? 0 : 3; // 50 OFF or 10% OFF
    const targetRotation = rotation + 360 * 5 + (targetSegment * 60);
    
    setRotation(targetRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      const wonPrize = SEGMENTS[targetSegment];
      setPrize(wonPrize.label);
      if (wonPrize.value) {
        applyCouponCode(wonPrize.value);
        localStorage.setItem('hasSpun', 'true');
        
        // Fire celebration
        const duration = 3000;
        const end = Date.now() + duration;
        (function frame() {
          confetti({
            particleCount: 5, angle: 60, spread: 55, origin: { x: 0 },
            colors: ['#FF6B6B', '#FFD700', '#4ECDC4']
          });
          confetti({
            particleCount: 5, angle: 120, spread: 55, origin: { x: 1 },
            colors: ['#FF6B6B', '#FFD700', '#4ECDC4']
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
      }
    }, 4000);
  };

  if (hasSpun) return null;

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ x: -100 }} animate={{ x: 0 }}
        className="fixed bottom-36 left-4 z-40 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)', border: '2px solid rgba(255,255,255,0.4)' }}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}>
          <Gift className="w-6 h-6 text-red-900" fill="currentColor" />
        </motion.div>
        
        {/* Helper tooltip */}
        <div className="absolute left-14 bg-white text-orange-900 text-[10px] font-black px-2 py-1 rounded w-max shadow-lg animate-pulse">
          SPIN & WIN!
          <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-white"></div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="relative p-6 rounded-3xl w-full max-w-sm flex flex-col items-center border shadow-2xl"
              style={{ background: '#111', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20">
                <X className="w-5 h-5 text-white" />
              </button>
              
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-1">Daily Spin & Win</h2>
              <p className="text-xs text-white/50 mb-8">Test your luck, win delicious discounts!</p>
              
              {/* Wheel Container */}
              <div className="relative w-64 h-64 mb-8">
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 text-4xl" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
                  👇
                </div>
                
                {/* The Wheel */}
                <motion.div 
                  className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-[-10px_-10px_30px_rgba(255,107,107,0.2),10px_10px_30px_rgba(255,142,83,0.2)] relative"
                  animate={{ rotate: rotation }}
                  transition={{ duration: 4, type: 'tween', ease: 'circOut' }}
                >
                  {SEGMENTS.map((seg, i) => (
                    <div 
                      key={i} 
                      className="absolute w-[50%] h-[50%] origin-bottom-right flex items-center justify-center"
                      style={{ 
                        background: seg.color,
                        transform: `rotate(${i * 60}deg) skewY(30deg)`,
                        left: 0, top: 0
                      }}
                    >
                      <span 
                        className="text-[10px] font-black text-white ml-8 mt-8"
                        style={{ transform: 'skewY(-30deg) rotate(15deg)' }}
                      >
                        {seg.label}
                      </span>
                    </div>
                  ))}
                  
                  {/* Center Dot */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border-4 border-yellow-500 z-10 flex items-center justify-center shadow-inner">
                    <span className="text-[10px]">⭐</span>
                  </div>
                </motion.div>
              </div>

              {prize ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <h3 className="text-2xl font-black text-green-400 mb-2">🎉 YOU WON! 🎉</h3>
                  <p className="text-orange-100 font-bold bg-white/10 px-4 py-2 rounded-xl mb-4">{prize}</p>
                  <p className="text-xs text-orange-100/60 mb-4">Coupon has been automatically applied to your cart.</p>
                  <button onClick={() => setIsOpen(false)} className="btn-primary w-full shadow-[0_0_20px_rgba(255,107,107,0.4)]">
                    Order Now
                  </button>
                </motion.div>
              ) : (
                <button 
                  onClick={spin} 
                  disabled={isSpinning}
                  className="btn-primary w-full py-4 text-base tracking-widest disabled:opacity-50 disabled:grayscale transition-all"
                  style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)', color: '#900', boxShadow: '0 0 20px rgba(255,215,0,0.5)' }}
                >
                  {isSpinning ? 'SPINNING...' : 'TAP TO SPIN'}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
