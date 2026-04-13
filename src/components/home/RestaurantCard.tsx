'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Clock3, Star } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { RestaurantSummary } from '@/lib/customer-data';

export default function RestaurantCard({ restaurant, index = 0 }: { restaurant: RestaurantSummary; index?: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="surface-card group overflow-hidden rounded-[30px]"
    >
      <Link href={`/restaurant/${restaurant.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
          <Image
            src={restaurant.heroImageUrl}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(8,10,16,0.92)_100%)]" />
          {!restaurant.isOpen && (
            <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white/90">
              Closed
            </span>
          )}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">Restaurant</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{restaurant.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-white/55">{restaurant.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/65">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-[#ffd98f]" />
                {restaurant.rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4 text-[#ff8a5b]" />
                {restaurant.etaMin} min
              </span>
              <span>Delivery from {formatPrice(restaurant.deliveryFee)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 px-5 py-4">
          {restaurant.cuisines.slice(0, 4).map((c) => (
            <span key={c} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              {c}
            </span>
          ))}
        </div>
      </Link>
    </motion.article>
  );
}
