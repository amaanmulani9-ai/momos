'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Eye, Heart, Plus } from 'lucide-react';
import { useCart } from '@/lib/store';
import { cn, formatPrice } from '@/lib/format';
import type { ProductDetail } from '@/lib/customer-data';

interface ProductGridCardProps {
  product: ProductDetail;
  priority?: boolean;
  onQuickView?: (product: ProductDetail) => void;
  className?: string;
  /** Show kitchen name when browsing the global menu. */
  showRestaurant?: boolean;
}

export default function ProductGridCard({
  product,
  priority = false,
  onQuickView,
  className,
  showRestaurant = false,
}: ProductGridCardProps) {
  const { addItem, toggleWishlist, wishlist } = useCart();
  const wished = wishlist.includes(product.id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn('surface-card overflow-hidden rounded-[28px]', className)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority={priority}
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(8,10,16,0.86)_100%)]" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          {product.badge && (
            <span className="rounded-full bg-[rgba(8,10,16,0.78)] px-3 py-1 text-[11px] font-semibold text-white">
              {product.badge}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[rgba(8,10,16,0.65)] text-white/85 backdrop-blur"
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className="h-4 w-4" fill={wished ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className={product.isVeg ? 'veg-dot' : 'nonveg-dot'} />
          <span className="text-xs text-white/55">{product.servings}</span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          {showRestaurant && (
            <Link
              href={`/restaurant/${product.restaurantSlug}`}
              className="text-xs font-medium uppercase tracking-[0.14em] text-[#ffb08a] hover:text-white"
            >
              {product.restaurantName}
            </Link>
          )}
          <Link href={`/menu/${product.slug}`} className="block">
            <h3 className="line-clamp-1 text-lg font-semibold text-white">{product.name}</h3>
          </Link>
          <p className="line-clamp-2 text-sm leading-6 text-white/58">{product.description}</p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-white">{formatPrice(product.price)}</p>
            {product.originalPrice && (
              <p className="text-xs text-white/35 line-through">{formatPrice(product.originalPrice)}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(product)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors hover:border-white/20 hover:text-white"
                aria-label={`Quick view ${product.name}`}
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => addItem(product)}
              disabled={!product.isAvailable}
              className="btn-primary h-10 min-w-10 px-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{product.isAvailable ? 'Add' : 'Sold out'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

