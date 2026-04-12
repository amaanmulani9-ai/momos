'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Plus, Star, Flame } from 'lucide-react';
import { useCart } from '@/lib/store';
import type { Product } from '@/lib/data';

const SPICE_COLORS: Record<string, string> = {
  mild: '#27ae60',
  medium: '#f39c12',
  hot: '#e74c3c',
  'extra-hot': '#8e44ad',
};

const SPICE_LABELS: Record<string, string> = {
  mild: 'Mild',
  medium: 'Medium',
  hot: 'Hot 🔥',
  'extra-hot': 'Extra Hot 🔥🔥',
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="card-hover rounded-3xl overflow-hidden flex flex-col group relative"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* badge */}
      {product.badge && (
        <div
          className="absolute top-3 left-3 z-10 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)', color: '#fff' }}
        >
          {product.badge}
        </div>
      )}

      {/* Veg/Non-veg dot */}
      <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: product.isVeg ? '#27ae60' : '#c0392b', background: '#1a0a00' }}>
        <div className="w-3 h-3 rounded-full" style={{ background: product.isVeg ? '#27ae60' : '#c0392b' }} />
      </div>

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-red-950/30">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.src = 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80';
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,10,0,0.8) 0%, transparent 60%)' }} />
        
        {/* Discount */}
        {product.originalPrice && (
          <div className="absolute bottom-3 left-3 text-xs font-bold px-2 py-1 rounded-full bg-green-600 text-white">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-orange-100 text-base leading-tight">{product.name}</h3>
          <p className="text-xs text-orange-100/50 mt-1 leading-relaxed line-clamp-2">{product.description}</p>
        </div>

        {/* Spice & servings row */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3" style={{ color: SPICE_COLORS[product.spiceLevel] }} />
            <span style={{ color: SPICE_COLORS[product.spiceLevel] }}>{SPICE_LABELS[product.spiceLevel]}</span>
          </div>
          <span className="text-orange-100/30">•</span>
          <span className="text-orange-100/50">{product.servings}</span>
        </div>

        {/* Price and Add */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xl font-bold text-orange-300">₹{product.price}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-orange-100/30 line-through">₹{product.originalPrice}</span>
            )}
          </div>

          {product.isAvailable ? (
            <motion.button
              onClick={() => addItem(product)}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)' }}
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-5 h-5 text-white" />
            </motion.button>
          ) : (
            <span className="text-xs text-red-400 font-medium px-3 py-1 rounded-full border border-red-800">Sold Out</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
