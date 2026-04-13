'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Flame, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import type { ProductDetail, ProductSummary, ReviewRecord } from '@/lib/customer-data';
import ProductGridCard from '@/components/customer/ProductGridCard';

const SPICE_LABELS = {
  mild: 'Mild',
  medium: 'Medium',
  hot: 'Hot',
  'extra-hot': 'Extra hot',
};

const SPICE_COLORS = {
  mild: '#8ad7af',
  medium: '#f2c46d',
  hot: '#ff8a5b',
  'extra-hot': '#ff5d6c',
};

interface ProductDetailViewProps {
  product: ProductDetail;
  relatedProducts?: ProductSummary[];
  reviews?: ReviewRecord[];
  variant?: 'page' | 'sheet';
  onClose?: () => void;
}

export default function ProductDetailView({
  product,
  relatedProducts = [],
  reviews = [],
  variant = 'page',
  onClose,
}: ProductDetailViewProps) {
  const { items, addItem, updateQuantity, recentOrders } = useCart();
  const cartLine = items.find((item) => item.product.id === product.id);
  const quantity = cartLine?.quantity ?? 0;
  const isSheet = variant === 'sheet';
  const reordered = recentOrders.some((order) => order.items.some((item) => item.productId === product.id));

  return (
    <div className={isSheet ? 'max-h-[85vh] overflow-y-auto' : 'app-page'}>
      <div className={isSheet ? 'space-y-8 p-5' : 'app-container space-y-10'}>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-4">
            <div className="relative aspect-[1.05/1] overflow-hidden rounded-[34px] border border-white/10 bg-white/5">
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,16,0.06)_0%,rgba(8,10,16,0.62)_100%)]" />
              {isSheet && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[rgba(8,10,16,0.68)] text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className={product.isVeg ? 'veg-dot' : 'nonveg-dot'} />
                <span className="rounded-full bg-[rgba(8,10,16,0.72)] px-3 py-1 text-xs text-white/68">{product.servings}</span>
              </div>
            </div>

            {!isSheet && product.gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {product.gallery.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-[22px] border border-white/10 bg-white/5">
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="section-kicker">{product.categoryName}</div>
              <div className="space-y-3">
                <h1 className="section-title text-4xl text-white sm:text-5xl">{product.name}</h1>
                <p className="section-copy text-base">{product.longDescription}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
                  <Flame className="h-4 w-4" style={{ color: SPICE_COLORS[product.spiceLevel] }} />
                  {SPICE_LABELS[product.spiceLevel]}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
                  <ShoppingBag className="h-4 w-4 text-[#ff8a5b]" />
                  Ready in 25 to 35 min
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
                  <Star className="h-4 w-4 text-[#ffd98f]" />
                  4.9 guest rating
                </div>
                {reordered && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(147,221,184,0.25)] bg-[rgba(147,221,184,0.12)] px-4 py-2 text-sm text-[#d8ffe9]">
                    Ordered before
                  </div>
                )}
              </div>
            </div>

            <div className="surface-card rounded-[30px] p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold text-white">{formatPrice(product.price)}</p>
                  {product.originalPrice && (
                    <p className="mt-1 text-sm text-white/35 line-through">{formatPrice(product.originalPrice)}</p>
                  )}
                </div>
                {product.badge && (
                  <span className="rounded-full bg-[rgba(255,138,91,0.14)] px-3 py-1 text-xs font-semibold text-[#ffc2a1]">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {quantity > 0 ? (
                  <div className="qty-counter">
                    <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => updateQuantity(product.id, quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => addItem(product)} className="btn-primary">
                    <Plus className="h-4 w-4" />
                    Add to cart
                  </button>
                )}
                {!isSheet && (
                  <Link href="/cart" className="btn-secondary">
                    Review cart
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            <div className="surface-soft rounded-[30px] p-6">
              <h2 className="text-lg font-semibold text-white">What to expect</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-white/65">
                  {product.isVeg ? 'Veg item' : 'Contains meat'}
                </span>
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-white/65">
                  May contain gluten
                </span>
                <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-white/65">
                  Contains dairy traces
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-white/65 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">Handmade dumplings with bold chutney and a freshly cooked finish.</div>
                <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">Packed for heat retention and quick local delivery.</div>
                <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">Great for solo meals, add-on drinks, or combo upgrades.</div>
                <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">Best paired with your saved cart and WhatsApp support if needed.</div>
              </div>
            </div>
          </div>
        </div>

        {!isSheet && reviews.length > 0 && (
          <section className="space-y-5">
            <div>
              <p className="section-kicker">Guest feedback</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Why customers keep reordering</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="surface-card rounded-[28px] p-5">
                  <p className="text-sm leading-6 text-white/68">&ldquo;{review.text}&rdquo;</p>
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{review.name}</p>
                      <p className="text-xs text-white/38">{review.date}</p>
                    </div>
                    <div className="text-sm text-[#ffd98f]">{'★'.repeat(review.rating)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isSheet && relatedProducts.length > 0 && (
          <section className="space-y-5 pb-8">
            <div>
              <p className="section-kicker">Keep the order flowing</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Related picks</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.slice(0, 3).map((relatedProduct) => (
                <ProductGridCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

