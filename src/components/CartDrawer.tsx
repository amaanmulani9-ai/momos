'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/lib/store';
import { fallbackSettings } from '@/lib/customer-data';
import { formatPrice } from '@/lib/format';

export default function CartDrawer() {
  const pathname = usePathname();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
    itemCount,
  } = useCart();

  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-[linear-gradient(180deg,#0f1420,#090b11)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/35">Current cart</p>
                <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
                  <ShoppingBag className="h-5 w-5 text-[#ff8a5b]" />
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="surface-card flex h-20 w-20 items-center justify-center rounded-[28px]">
                    <ShoppingBag className="h-8 w-8 text-white/55" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">Your cart is empty</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-white/55">
                    Add a few comfort-food favorites and we will keep your order summary ready here.
                  </p>
                  <Link href="/menu" className="btn-primary mt-6">
                    Browse menu
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="surface-card flex gap-4 rounded-[28px] p-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-[22px] bg-white/5">
                        <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <p className="line-clamp-1 text-sm font-semibold text-white">{item.product.name}</p>
                          <p className="mt-1 text-xs text-white/45">{item.product.servings}</p>
                          <p className="mt-3 text-base font-semibold text-white">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>

                        <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-2 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-white/10 px-5 py-5">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                  {deliveryFee > 0 ? (
                    <p className="text-sm text-white/62">
                      Add <span className="font-semibold text-white">{formatPrice(Math.max(fallbackSettings.freeDeliveryAbove - subtotal, 0))}</span> more for free delivery.
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-[#9de7c2]">Free delivery unlocked.</p>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-white/65">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery</span>
                      <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold text-white">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link href="/cart" className="btn-secondary flex-1 justify-center" onClick={closeCart}>
                    Open cart
                  </Link>
                  <Link href="/checkout" className="btn-primary flex-1 justify-center" onClick={closeCart}>
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

