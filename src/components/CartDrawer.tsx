'use client';

import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/store';
import { SHOP_INFO } from '@/lib/data';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, deliveryFee, total, itemCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col"
            style={{ background: '#1a0a00', borderLeft: '1px solid rgba(192,57,43,0.3)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                <h2 className="font-bold text-lg text-orange-100">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-900/50 text-red-300">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors text-orange-100/70"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <span className="text-7xl">🥟</span>
                  <p className="text-orange-100/50 text-sm">Your cart is empty.<br />Add some delicious momos!</p>
                  <Link href="/menu" onClick={closeCart} className="btn-primary text-sm py-2 px-5">
                    Browse Menu
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-3 p-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative bg-red-950">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.src = 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&q=80';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-orange-100 truncate">{item.product.name}</p>
                      <p className="text-xs text-orange-300/60">{item.product.servings}</p>
                      <p className="text-sm font-bold text-orange-400 mt-1">₹{item.product.price * item.quantity}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between shrink-0">
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 rounded-lg hover:bg-red-900/40 text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-orange-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold text-orange-100 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-orange-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-white/10 space-y-3">
                {/* Delivery progress bar */}
                <div className="bg-white/5 rounded-xl p-3">
                  {deliveryFee > 0 ? (
                    <>
                      <p className="text-xs text-orange-200/80 mb-2 font-medium">
                        Add <span className="text-orange-400 font-bold">₹{Math.max(SHOP_INFO.freeDeliveryAbove - subtotal, 0)}</span> more to get <span className="text-green-400 font-bold">FREE Delivery</span> 🎉
                      </p>
                      <div className="h-1.5 w-full bg-red-950 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((subtotal / SHOP_INFO.freeDeliveryAbove) * 100, 100)}%` }}
                          transition={{ type: 'spring', bounce: 0, duration: 1 }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                       <span className="text-2xl animate-bounce">🛵</span>
                       <p className="text-sm font-black text-green-400">Woohoo! You earned FREE Delivery!</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-orange-100/60">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-orange-100/60">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? <span className="text-green-400">FREE</span> : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-orange-100 pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full justify-center text-sm"
                >
                  Proceed to Checkout
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
