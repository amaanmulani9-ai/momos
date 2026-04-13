'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useCart } from '@/lib/store';
import { type Product } from '@/lib/data';

function HomeQtyCounter({ product, qty }: { product: Product; qty: number }) {
  const { addItem, updateQuantity, removeItem } = useCart();

  return (
    <div className="qty-counter">
      <button onClick={() => qty > 1 ? updateQuantity(product.id, qty - 1) : removeItem(product.id)}>−</button>
      <span>{qty}</span>
      <button onClick={() => addItem(product)}>+</button>
    </div>
  );
}

function HomeProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const qty = items.find((entry) => entry.product.id === product.id)?.quantity || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="food-card group"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(event) => {
            (event.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80';
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(7,6,15,0.7) 0%, transparent 60%)' }} />
        {product.badge && (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{ background: 'rgba(255,107,107,0.9)', color: '#fff' }}
          >
            {product.badge}
          </span>
        )}
        <span className={`absolute right-2 top-2 ${product.isVeg ? 'veg-dot' : 'nonveg-dot'}`} />
      </div>

      <div className="p-4">
        <p className="mb-1 truncate text-sm font-bold leading-snug" style={{ color: '#FAFAFA' }}>{product.name}</p>
        <p className="mb-3 text-xs" style={{ color: 'rgba(250,250,250,0.4)' }}>{product.servings}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-black" style={{ color: '#FAFAFA' }}>₹{product.price}</span>
            {product.originalPrice && (
              <span className="ml-1.5 text-xs line-through" style={{ color: 'rgba(250,250,250,0.3)' }}>
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {qty === 0 ? (
            <motion.button onClick={() => addItem(product)} className="add-btn px-3" whileTap={{ scale: 0.9 }}>
              ADD +
            </motion.button>
          ) : (
            <HomeQtyCounter product={product} qty={qty} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function HomeFeaturedGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <HomeProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
