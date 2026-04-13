'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, TicketPercent, Trash2 } from 'lucide-react';
import ProductGridCard from '@/components/customer/ProductGridCard';
import { fallbackProducts, fallbackSettings } from '@/lib/customer-data';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    coupon,
    couponSavings,
    applyCouponCode,
    removeCoupon,
    updateQuantity,
    clearCart,
  } = useCart();
  const [couponInput, setCouponInput] = useState(coupon);
  const [couponMessage, setCouponMessage] = useState('');
  const recommendedProducts = fallbackProducts.filter((product) => product.featured).slice(0, 3);
  const bestCouponHint = subtotal >= 350 ? 'FREEDEL' : subtotal >= 250 ? 'NEW50' : subtotal >= 100 ? 'WEEKEND' : 'MOMOS10';

  const handleApplyCoupon = () => {
    const result = applyCouponCode(couponInput);
    setCouponMessage(result.message);
  };

  if (items.length === 0) {
    return (
      <div className="app-page">
        <div className="app-container">
          <div className="surface-card mx-auto flex max-w-2xl flex-col items-center rounded-[36px] px-6 py-16 text-center">
            <div className="surface-soft flex h-20 w-20 items-center justify-center rounded-[28px]">
              <ShoppingBag className="h-8 w-8 text-white/55" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-white">Your cart is waiting</h1>
            <p className="mt-3 max-w-lg text-sm leading-7 text-white/56">
              Start from the menu, open a product, or use quick add to build a full checkout-ready order.
            </p>
            <Link href="/menu" className="btn-primary mt-6">
              Explore menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-container space-y-8">
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div>
              <p className="section-kicker">Cart review</p>
              <h1 className="mt-2 text-4xl font-semibold text-white">Everything before checkout lives here.</h1>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="surface-card flex gap-4 rounded-[30px] p-4 sm:p-5">
                  <div className="relative h-24 w-24 overflow-hidden rounded-[24px] bg-white/5">
                    <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <Link href={`/menu/${item.product.slug}`} className="block">
                        <h2 className="line-clamp-1 text-lg font-semibold text-white">{item.product.name}</h2>
                      </Link>
                      <p className="mt-1 text-sm text-white/46">{item.product.servings}</p>
                      <p className="mt-3 text-base font-medium text-white">{formatPrice(item.product.price)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="qty-counter">
                        <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, 0)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/62 transition-colors hover:border-white/20 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface-card rounded-[30px] p-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,138,91,0.12)]">
                  <TicketPercent className="h-5 w-5 text-[#ff8a5b]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Coupons and delivery</h2>
                  <p className="text-sm text-white/48">Apply your savings before you continue.</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Enter coupon code"
                  className="form-input"
                />
                <button type="button" onClick={handleApplyCoupon} className="btn-secondary sm:min-w-32">
                  Apply
                </button>
              </div>
              {!coupon && (
                <button
                  type="button"
                  onClick={() => {
                    setCouponInput(bestCouponHint);
                    const result = applyCouponCode(bestCouponHint);
                    setCouponMessage(result.message);
                  }}
                  className="mt-3 rounded-full border border-[rgba(255,138,91,0.28)] bg-[rgba(255,138,91,0.1)] px-4 py-2 text-sm text-white"
                >
                  Best for this cart: {bestCouponHint}
                </button>
              )}

              {coupon && (
                <div className="mt-4 flex items-center justify-between rounded-[22px] border border-[rgba(147,221,184,0.2)] bg-[rgba(147,221,184,0.08)] px-4 py-3 text-sm text-white/72">
                  <span>
                    {coupon} applied. You saved <strong>{formatPrice(couponSavings)}</strong>.
                  </span>
                  <button type="button" onClick={removeCoupon} className="font-medium text-white">
                    Remove
                  </button>
                </div>
              )}

              {couponMessage && !coupon && (
                <p className="mt-3 text-sm text-white/48">{couponMessage}</p>
              )}

              <div className="mt-6 rounded-[26px] border border-white/8 bg-white/4 p-5">
                <div className="flex items-center justify-between text-sm text-white/58">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-white/58">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
                </div>
                {deliveryFee > 0 && (
                  <p className="mt-3 text-xs text-white/45">
                    Add {formatPrice(Math.max(fallbackSettings.freeDeliveryAbove - subtotal, 0))} more to unlock free delivery.
                  </p>
                )}
                {couponSavings > 0 && (
                  <div className="mt-3 flex items-center justify-between text-sm text-[#9de7c2]">
                    <span>Coupon savings</span>
                    <span>-{formatPrice(couponSavings)}</span>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/checkout" className="btn-primary flex-1 justify-center">
                  Continue to checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button type="button" onClick={clearCart} className="btn-secondary">
                  Clear cart
                </button>
              </div>
            </div>

            <div className="surface-card rounded-[30px] p-6">
              <p className="section-kicker">Add one more thing</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Popular add-ons</h2>
              <div className="mt-5 grid gap-4">
                {recommendedProducts.map((product) => (
                  <ProductGridCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

