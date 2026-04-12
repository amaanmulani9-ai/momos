'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/lib/store';
import { PRODUCTS } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addItem, items } = useCart();
  const saved = PRODUCTS.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen pt-16 pb-24" style={{ background: '#07060f' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(7,6,15,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
        <Link href="/" className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </Link>
        <div>
          <h1 className="font-black text-lg" style={{ color: '#FAFAFA' }}>My Saved Items</h1>
          <p className="text-xs" style={{ color: 'rgba(250,250,250,0.4)' }}>{saved.length} item{saved.length !== 1 ? 's' : ''} saved</p>
        </div>
        <Heart className="w-5 h-5 ml-auto" style={{ color: '#FF6B6B' }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {saved.length === 0 ? (
          <div className="text-center pt-24">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-6">💔</motion.div>
            <p className="text-xl font-bold mb-2" style={{ color: '#FAFAFA' }}>No saved items yet</p>
            <p className="text-sm mb-6" style={{ color: 'rgba(250,250,250,0.4)' }}>Tap the ♡ on any dish to save it here</p>
            <Link href="/menu" className="btn-primary">Browse Menu</Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {saved.map((product, i) => {
                const qty = items.find(it => it.product.id === product.id)?.quantity || 0;
                return (
                  <motion.div key={product.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 p-4 rounded-2xl"
                    style={{ background: '#0f0e1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0">
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&q=70'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: '#FAFAFA' }}>{product.name}</p>
                      <p className="text-xs mt-0.5 mb-3" style={{ color: 'rgba(250,250,250,0.4)' }}>{product.servings}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-black" style={{ color: '#FF6B6B' }}>₹{product.price}</span>
                        <motion.button onClick={() => addItem(product)} whileTap={{ scale: 0.9 }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)', color: '#fff' }}>
                          <ShoppingCart className="w-3 h-3" />
                          {qty > 0 ? `In Cart (${qty})` : 'Add to Cart'}
                        </motion.button>
                      </div>
                    </div>
                    <button onClick={() => toggleWishlist(product.id)}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors self-start shrink-0">
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
