'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, Grid2X2, List, Search, SlidersHorizontal } from 'lucide-react';
import ProductGridCard from '@/components/customer/ProductGridCard';
import ProductDetailView from '@/components/customer/ProductDetailView';
import { useCart } from '@/lib/store';
import { cn, formatPrice } from '@/lib/format';
import type { CategorySummary, ProductDetail, RestaurantSummary } from '@/lib/customer-data';

interface MenuPageViewProps {
  categories: CategorySummary[];
  products: ProductDetail[];
  initialCategory?: string;
  initialQuery?: string;
  /** When set, menu is scoped to one restaurant (Swiggy-style store page). */
  restaurant?: RestaurantSummary | null;
}

type LayoutMode = 'grid' | 'list';
type SpiceFilter = 'all' | 'mild' | 'medium' | 'hot' | 'extra-hot';

const SPICE_FILTERS: Array<{ value: SpiceFilter; label: string }> = [
  { value: 'all', label: 'Any spice' },
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'hot', label: 'Hot' },
  { value: 'extra-hot', label: 'Extra hot' },
];

const TRENDING_SEARCHES = ['momos', 'combo', 'pizza', 'chicken', 'veg'];

export default function MenuPageView({
  categories,
  products,
  initialCategory = 'all',
  initialQuery = '',
  restaurant = null,
}: MenuPageViewProps) {
  const { itemCount, total } = useCart();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialQuery);
  const [vegOnly, setVegOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [spiceFilter, setSpiceFilter] = useState<SpiceFilter>('all');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<ProductDetail | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('menu-filters-v1');
      if (raw) {
        const parsed = JSON.parse(raw) as {
          activeCategory?: string;
          vegOnly?: boolean;
          availableOnly?: boolean;
          spiceFilter?: SpiceFilter;
          search?: string;
        };
        if (parsed.activeCategory) setActiveCategory(parsed.activeCategory);
        if (typeof parsed.vegOnly === 'boolean') setVegOnly(parsed.vegOnly);
        if (typeof parsed.availableOnly === 'boolean') setAvailableOnly(parsed.availableOnly);
        if (parsed.spiceFilter) setSpiceFilter(parsed.spiceFilter);
        if (parsed.search) setSearch(parsed.search);
      }
      const recentRaw = localStorage.getItem('menu-recent-searches-v1');
      if (recentRaw) {
        const recent = JSON.parse(recentRaw) as string[];
        setRecentSearches(recent.slice(0, 5));
      }
    } catch {
      // Ignore localStorage parse errors.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'menu-filters-v1',
        JSON.stringify({
          activeCategory,
          vegOnly,
          availableOnly,
          spiceFilter,
          search,
        }),
      );
    } catch {
      // Ignore localStorage write failures.
    }
  }, [activeCategory, vegOnly, availableOnly, spiceFilter, search]);

  function rememberSearch(term: string) {
    const normalized = term.trim().toLowerCase();
    if (!normalized) return;
    const next = [normalized, ...recentSearches.filter((s) => s !== normalized)].slice(0, 5);
    setRecentSearches(next);
    try {
      localStorage.setItem('menu-recent-searches-v1', JSON.stringify(next));
    } catch {
      // Ignore storage failures.
    }
  }

  const filteredProducts = products.filter((product) => {
    if (activeCategory !== 'all' && product.categoryId !== activeCategory) {
      return false;
    }
    if (vegOnly && !product.isVeg) {
      return false;
    }
    if (availableOnly && !product.isAvailable) {
      return false;
    }
    if (spiceFilter !== 'all' && product.spiceLevel !== spiceFilter) {
      return false;
    }
    if (!search) {
      return true;
    }
    const query = search.toLowerCase().trim();
    const compact = query.replace(/\s+/g, '');
    const searchable = `${product.name} ${product.description} ${product.categoryName}`
      .toLowerCase()
      .replace(/\s+/g, '');
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.categoryName.toLowerCase().includes(query) ||
      searchable.includes(compact)
    );
  });

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (!search.trim()) return list;
    const query = search.trim().toLowerCase();
    return list.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(query) ? 1 : 0;
      const bStarts = b.name.toLowerCase().startsWith(query) ? 1 : 0;
      return bStarts - aStarts;
    });
  }, [filteredProducts, search]);

  const quickViewRelated = quickViewProduct
    ? products.filter((product) => product.categoryId === quickViewProduct.categoryId && product.id !== quickViewProduct.id)
    : [];

  return (
    <div className="app-page">
      <div className="app-container space-y-8">
        <section className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {restaurant ? (
                <>
                  <Link
                    href="/"
                    className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-white/55 transition-colors hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    All restaurants
                  </Link>
                  <p className="section-kicker">{restaurant.cuisines.slice(0, 2).join(' • ')}</p>
                  <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">{restaurant.name}</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">{restaurant.tagline}</p>
                  <p className="mt-2 text-sm text-white/45">
                    {restaurant.etaMin} min • ★ {restaurant.rating.toFixed(1)} • Delivery from{' '}
                    {formatPrice(restaurant.deliveryFee)}
                  </p>
                </>
              ) : (
                <>
                  <p className="section-kicker">All restaurants menu</p>
                  <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">Browse every dish in one place.</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">
                    Filter by category and spice. Items show which kitchen they ship from—your cart stays on one restaurant at a time.
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={cn('inline-flex h-11 w-11 items-center justify-center rounded-full border', layoutMode === 'grid' && 'bg-white text-black')}
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: layoutMode === 'grid' ? '#080a10' : 'rgba(255,255,255,0.65)' }}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={cn('inline-flex h-11 w-11 items-center justify-center rounded-full border', layoutMode === 'list' && 'bg-white text-black')}
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: layoutMode === 'list' ? '#080a10' : 'rgba(255,255,255,0.65)' }}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="surface-card rounded-[32px] p-4 sm:p-5">
            <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/4 px-4 py-3 text-white/55">
                <Search className="h-4 w-4" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onBlur={() => rememberSearch(search)}
                  placeholder="Search momos, pizza, noodles, combos..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVegOnly((value) => !value)}
                  className="rounded-full border px-4 py-2 text-sm"
                  style={{
                    borderColor: vegOnly ? 'rgba(147,221,184,0.45)' : 'rgba(255,255,255,0.1)',
                    background: vegOnly ? 'rgba(147,221,184,0.12)' : 'rgba(255,255,255,0.04)',
                    color: vegOnly ? '#d8ffe9' : 'rgba(255,255,255,0.64)',
                  }}
                >
                  Veg only
                </button>
                <button
                  type="button"
                  onClick={() => setAvailableOnly((value) => !value)}
                  className="rounded-full border px-4 py-2 text-sm"
                  style={{
                    borderColor: availableOnly ? 'rgba(255,138,91,0.38)' : 'rgba(255,255,255,0.1)',
                    background: availableOnly ? 'rgba(255,138,91,0.12)' : 'rgba(255,255,255,0.04)',
                    color: availableOnly ? '#ffd7bf' : 'rgba(255,255,255,0.64)',
                  }}
                >
                  In stock
                </button>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/62">
                  <SlidersHorizontal className="h-4 w-4" />
                  <select
                    value={spiceFilter}
                    onChange={(event) => setSpiceFilter(event.target.value as SpiceFilter)}
                    className="bg-transparent outline-none"
                  >
                    {SPICE_FILTERS.map((filter) => (
                      <option key={filter.value} value={filter.value} className="bg-[#0f1420] text-white">
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {[...TRENDING_SEARCHES, ...recentSearches]
                .filter((v, i, arr) => arr.indexOf(v) === i)
                .slice(0, 8)
                .map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearch(term);
                      rememberSearch(term);
                    }}
                    className="whitespace-nowrap rounded-full border border-white/8 bg-white/3 px-3 py-1 text-xs text-white/65"
                  >
                    #{term}
                  </button>
                ))}
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className="whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors"
                  style={{
                    borderColor: activeCategory === category.id ? 'rgba(255,138,91,0.38)' : 'rgba(255,255,255,0.08)',
                    background: activeCategory === category.id ? 'rgba(255,138,91,0.14)' : 'rgba(255,255,255,0.03)',
                    color: activeCategory === category.id ? '#ffffff' : 'rgba(255,255,255,0.58)',
                  }}
                >
                  <span className="mr-2">{category.emoji}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/55">
              Showing <span className="font-semibold text-white">{filteredProducts.length}</span> dishes
            </p>
            {(search || activeCategory !== 'all' || vegOnly || availableOnly || spiceFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSearch('');
                  setVegOnly(false);
                  setAvailableOnly(false);
                  setSpiceFilter('all');
                }}
                className="text-sm text-white/55 transition-colors hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>

          {sortedProducts.length === 0 ? (
            <div className="surface-card rounded-[32px] p-10 text-center">
              <h2 className="text-2xl font-semibold text-white">Nothing matched those filters</h2>
              <p className="mt-3 text-sm leading-7 text-white/55">
                Reset the filters or search by another dish, category, or spice level.
              </p>
            </div>
          ) : (
            <div className={layoutMode === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'grid gap-4'}>
              {sortedProducts.map((product, index) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                  onQuickView={setQuickViewProduct}
                  showRestaurant={!restaurant}
                  className={layoutMode === 'list' ? 'sm:grid sm:grid-cols-[280px_1fr]' : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {quickViewProduct && (
          <>
            <motion.button
              type="button"
              aria-label="Close product quick view"
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] rounded-t-[32px] border border-white/10 bg-[linear-gradient(180deg,#101521,#090b11)] lg:inset-8 lg:mx-auto lg:max-w-5xl lg:rounded-[36px]"
            >
              <ProductDetailView
                product={quickViewProduct}
                relatedProducts={quickViewRelated}
                variant="sheet"
                onClose={() => setQuickViewProduct(null)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-[76px] z-30 px-4 lg:hidden">
          <Link href="/cart" className="btn-primary w-full justify-between rounded-[24px] px-5 py-4 shadow-[0_24px_48px_rgba(255,93,108,0.32)]">
            <span>{itemCount} item{itemCount > 1 ? 's' : ''} in cart</span>
            <span>{formatPrice(total)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

