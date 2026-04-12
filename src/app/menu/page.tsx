'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS, CATEGORIES } from '@/lib/data';
import { useCart } from '@/lib/store';
import { Search, Star, Clock, Leaf, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

const SPICE_LABELS: Record<string, string> = { mild: '🟢 Mild', medium: '🟡 Medium', hot: '🔴 Hot', 'extra-hot': '💥 Extra Hot' };

function MenuContent() {
  const searchParams = useSearchParams();
  const { addItem, removeItem, items, updateQuantity, itemCount, total } = useCart();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [vegOnly, setVegOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const categories = CATEGORIES.filter(c => c.id !== 'all');

  function getQty(productId: string) {
    return items.find(i => i.product.id === productId)?.quantity || 0;
  }

  function handleAdd(product: (typeof PRODUCTS)[0]) {
    addItem(product);
  }

  function handleRemove(product: (typeof PRODUCTS)[0]) {
    const qty = getQty(product.id);
    if (qty > 1) updateQuantity(product.id, qty - 1);
    else removeItem(product.id);
  }

  function scrollToCategory(catId: string) {
    setActiveCategory(catId);
    const el = categoryRefs.current[catId];
    if (el) {
      const offset = 130;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  function toggleSection(catId: string) {
    setExpandedSections(prev => ({ ...prev, [catId]: !prev[catId] }));
  }

  const filteredBySearch = PRODUCTS.filter(p => {
    if (vegOnly && !p.isVeg) return false;
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
  });

  const categoryGroups = categories.map(cat => ({
    ...cat,
    products: filteredBySearch.filter(p => p.category === cat.id),
  })).filter(g => g.products.length > 0);

  return (
    <div className="min-h-screen pt-16" style={{ background: '#0d0500' }}>
      {/* ── Sticky restaurant header ── */}
      <div className="sticky top-16 z-20 px-4 py-3" style={{ background: 'rgba(13,5,0,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Restaurant info strip */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0">
                <Image src="/images/logo.png" alt="Meghna's Kitchen" fill className="object-cover" />
              </div>
              <div>
                <h1 className="font-black text-orange-100 text-lg leading-tight">Meghna's Kitchen</h1>
                <div className="flex flex-wrap items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-orange-100/60">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 4.9 (500+ ratings)
                  </span>
                  <span className="flex items-center gap-1 text-xs text-orange-100/60">
                    <Clock className="w-3 h-3 text-orange-400" /> 25–35 min
                  </span>
                  <span className="text-xs text-orange-100/60">₹30 delivery</span>
                </div>
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-100/40" />
                <input
                  id="menu-search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search dishes..."
                  className="pl-9 pr-4 py-2 rounded-xl text-sm w-44 sm:w-56"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fdf6ec', outline: 'none' }}
                />
              </div>
              <button
                id="veg-filter-btn"
                onClick={() => setVegOnly(!vegOnly)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0"
                style={{
                  background: vegOnly ? 'rgba(39,174,96,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${vegOnly ? '#27ae60' : 'rgba(255,255,255,0.1)'}`,
                  color: vegOnly ? '#27ae60' : 'rgba(253,246,236,0.6)',
                }}>
                <Leaf className="w-3 h-3" /> Veg Only
              </button>
            </div>
          </div>

          {/* Category scroll tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-3 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => scrollToCategory(cat.id)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
                style={{
                  background: activeCategory === cat.id ? '#ff7c00' : 'rgba(255,255,255,0.06)',
                  color: activeCategory === cat.id ? '#fff' : 'rgba(253,246,236,0.6)',
                  border: activeCategory === cat.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}>
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout: sidebar + items ── */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-52">
            <p className="text-xs text-orange-100/40 font-semibold uppercase tracking-wider mb-3">Categories</p>
            <nav className="space-y-0.5">
              {categories.map(cat => {
                const count = filteredBySearch.filter(p => p.category === cat.id).length;
                if (count === 0) return null;
                return (
                  <button key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                    style={{
                      background: activeCategory === cat.id ? 'rgba(255,124,0,0.12)' : 'transparent',
                      color: activeCategory === cat.id ? '#ff7c00' : 'rgba(253,246,236,0.6)',
                      borderLeft: activeCategory === cat.id ? '3px solid #ff7c00' : '3px solid transparent',
                    }}>
                    <span>{cat.emoji} {cat.name}</span>
                    <span className="text-xs opacity-60 shrink-0">{count}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Items list */}
        <main className="flex-1 pb-32">
          {categoryGroups.length === 0 ? (
            <div className="text-center py-24 text-orange-100/40">
              <p className="text-5xl mb-3">🔍</p>
              <p className="text-lg">No dishes found for "{search}"</p>
              <button onClick={() => setSearch('')} className="mt-4 text-orange-400 text-sm hover:underline">Clear search</button>
            </div>
          ) : (
            categoryGroups.map(group => {
              const isExpanded = expandedSections[group.id] !== false;
              const visibleProducts = isExpanded ? group.products : group.products.slice(0, 4);
              return (
                <div
                  key={group.id}
                  ref={el => { categoryRefs.current[group.id] = el; }}
                  className="mb-8"
                >
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(group.id)}
                    className="w-full flex items-center justify-between py-3 border-b mb-4"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <h2 className="text-base font-bold text-orange-100">
                      {group.emoji} {group.name}
                      <span className="text-orange-100/40 font-normal text-sm ml-2">({group.products.length})</span>
                    </h2>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-orange-100/40" /> : <ChevronDown className="w-4 h-4 text-orange-100/40" />}
                  </button>

                  <div className="space-y-0">
                    <AnimatePresence>
                      {visibleProducts.map((product, i) => {
                        const qty = getQty(product.id);
                        return (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex gap-4 py-5 border-b"
                            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                          >
                            {/* Left: Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1.5">
                                <span className={product.isVeg ? 'veg-dot shrink-0 mt-0.5' : 'nonveg-dot shrink-0 mt-0.5'} />
                                {product.badge && (
                                  <span className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0"
                                    style={{ background: 'rgba(255,124,0,0.15)', color: '#ff7c00' }}>{product.badge}</span>
                                )}
                              </div>
                              <h3 className="font-semibold text-orange-100 text-sm leading-snug">{product.name}</h3>
                              <div className="flex items-center gap-3 mt-1 mb-2">
                                <span className="font-bold text-orange-100 text-sm">₹{product.price}</span>
                                {product.originalPrice && (
                                  <span className="text-orange-100/30 text-xs line-through">₹{product.originalPrice}</span>
                                )}
                                <span className="text-xs text-orange-100/40">{product.servings}</span>
                                <span className="text-xs text-orange-100/40">{SPICE_LABELS[product.spiceLevel]}</span>
                              </div>
                              <p className="text-xs text-orange-100/50 leading-relaxed line-clamp-2">{product.description}</p>
                            </div>

                            {/* Right: Image + Add button */}
                            <div className="relative shrink-0 w-28">
                              <div className="w-28 h-24 rounded-2xl overflow-hidden relative">
                                <Image
                                  src={product.imageUrl.startsWith('http') ? product.imageUrl : `https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&q=70`}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                                {qty === 0 ? (
                                  <button onClick={() => handleAdd(product)} className="add-btn w-20 rounded-lg text-sm font-bold"
                                    style={{ width: '80px', height: '34px', fontSize: '0.8rem' }}>
                                    ADD +
                                  </button>
                                ) : (
                                  <div className="qty-counter" style={{ width: '80px' }}>
                                    <button onClick={() => handleRemove(product)}>−</button>
                                    <span>{qty}</span>
                                    <button onClick={() => handleAdd(product)}>+</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Show more */}
                    {!isExpanded && group.products.length > 4 && (
                      <button onClick={() => toggleSection(group.id)}
                        className="w-full py-3 text-sm text-orange-400 font-medium hover:underline text-center mt-2">
                        +{group.products.length - 4} more {group.name} items
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>

      {/* ── Floating View Cart ── */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="view-cart-bar"
          >
            <div className="text-white">
              <p className="text-sm font-black">{itemCount} item{itemCount > 1 ? 's' : ''} added</p>
              <p className="text-white/70 text-xs">Extra charges may apply</p>
            </div>
            <Link href="/checkout" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all">
              View Cart → ₹{total}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><p className="text-orange-100/40">Loading menu...</p></div>}>
      <MenuContent />
    </Suspense>
  );
}
