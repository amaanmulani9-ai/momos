'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { PRODUCTS } from '@/lib/data';

const LOCATIONS = ['Sector 18', 'Sector 62', 'Sector 15', 'Indirapuram', 'Greater Noida', 'Sector 50', 'Delhi', 'Vaishali'];
const TIMES = ['Just now', '1 min ago', '2 mins ago', 'Just now'];

export default function LiveOrders() {
  const [activeToast, setActiveToast] = useState<{ product: typeof PRODUCTS[0], loc: string, time: string, id: number } | null>(null);

  useEffect(() => {
    // Start after 5 seconds
    const timeout = setTimeout(() => {
      showRandomOrder();
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const showRandomOrder = () => {
    const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];

    setActiveToast({
      product: randomProduct,
      loc: randomLoc,
      time: randomTime,
      id: Date.now()
    });

    // Hide after 4 seconds
    setTimeout(() => {
      setActiveToast(null);
      // Schedule next one between 10-25 seconds
      const nextDelay = Math.random() * 15000 + 10000;
      setTimeout(showRandomOrder, nextDelay);
    }, 4000);
  };

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          key={activeToast.id}
          initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
          className="fixed top-20 left-1/2 z-40 p-2 pr-4 rounded-full flex items-center gap-3 shadow-2xl pointer-events-none"
          style={{ 
            background: 'rgba(10,9,20,0.9)', 
            border: '1px solid rgba(255,107,107,0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0">
            <Image 
              src={activeToast.product.imageUrl} 
              alt={activeToast.product.name} 
              fill 
              className="object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=100&q=70'; }}
            />
          </div>
          <div>
            <p className="text-[11px] text-orange-100/50 leading-tight">Someone in {activeToast.loc} ordered</p>
            <p className="text-sm font-bold text-orange-100 leading-tight truncate max-w-[180px] sm:max-w-xs">{activeToast.product.name}</p>
          </div>
          <div className="ml-2 text-[10px] text-green-400 font-bold px-1.5 py-0.5 rounded bg-green-400/10 shrink-0">
            {activeToast.time}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
