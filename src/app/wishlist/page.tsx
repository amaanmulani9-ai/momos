'use client';

import Link from 'next/link';
import ProductGridCard from '@/components/customer/ProductGridCard';
import { fallbackProducts } from '@/lib/customer-data';
import { useCart } from '@/lib/store';

export default function WishlistPage() {
  const { wishlist } = useCart();
  const savedProducts = fallbackProducts.filter((product) => wishlist.includes(product.id));

  return (
    <div className="app-page">
      <div className="app-container space-y-8">
        <section>
          <p className="section-kicker">Wishlist</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Saved dishes for later.</h1>
          <p className="mt-4 text-sm leading-7 text-white/56">
            Wishlist items now deep-link back into the real product detail route and can be re-added quickly.
          </p>
        </section>

        {savedProducts.length === 0 ? (
          <div className="surface-card rounded-[34px] px-6 py-16 text-center">
            <h2 className="text-3xl font-semibold text-white">No saved dishes yet</h2>
            <p className="mt-3 text-sm leading-7 text-white/56">
              Save dishes from the menu or quick-view sheets to build your shortlist here.
            </p>
            <Link href="/menu" className="btn-primary mt-6">
              Browse menu
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {savedProducts.map((product) => (
              <ProductGridCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

