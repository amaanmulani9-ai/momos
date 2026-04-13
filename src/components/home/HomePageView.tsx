'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { MapPin, Search, UtensilsCrossed } from 'lucide-react';
import {
  type CategorySummary,
  type ProductDetail,
  type RestaurantSummary,
  type ReviewRecord,
  type ShopSettings,
} from '@/lib/customer-data';

interface HomePageViewProps {
  categories: CategorySummary[];
  products: ProductDetail[];
  reviews: ReviewRecord[];
  settings: ShopSettings;
  restaurants: RestaurantSummary[];
}

export default function HomePageView({
  products,
}: HomePageViewProps) {
  const featuredProduct = products.find((p) => p.featured) || products[0];
  const orderAgainProducts = products.slice(1, 4);

  return (
    <div className="min-h-screen bg-[#ebebed] text-[#1a1a1a] pb-24 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-16 pb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#e04d01]" />
          <span className="text-xs font-semibold leading-snug">
            Manhattan,<br />NY
          </span>
        </div>
        <div className="text-center font-display text-lg font-extrabold leading-tight tracking-tight">
          The Culinary<br />Editorial
        </div>
        <Search className="h-5 w-5 text-gray-600" />
      </header>

      <main className="px-5 mt-6 w-full max-w-md mx-auto relative space-y-10">
        {/* Hero Text */}
        <div className="text-center px-4 mt-8">
          <h1 className="text-[2.6rem] leading-[1.1] font-bold text-gray-900 tracking-tight">
            Curate Your <br />
            <span className="font-display italic text-[#c1121f] text-[2.8rem] pr-2">Evening</span>
          </h1>
        </div>

        {/* Search Input */}
        <div className="relative mx-auto mt-8 flex w-full max-w-[90%] items-center overflow-hidden rounded-full bg-white p-1.5 shadow-sm">
          <input
            type="text"
            placeholder="Search for dishes..."
            className="w-full bg-transparent px-5 py-3 text-sm outline-none text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal"
          />
          <button className="rounded-full bg-[#b81d2a] px-7 py-3 text-sm font-semibold text-white transition-opacity hover:bg-red-800">
            Search
          </button>
        </div>

        {/* Featured Item */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mt-10 w-full max-w-[90%] overflow-hidden rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] bg-black"
        >
          <div className="aspect-square w-full relative">
            <img
              src="https://images.unsplash.com/photo-1541529086526-db283c561f1c?auto=format&fit=crop&w=800&q=80"
              alt="Featured Dish"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </motion.div>

        {/* Order Again */}
        <div className="mt-12 px-4">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Order Again</h2>
            <Link href="/profile" className="text-sm font-bold text-[#b81d2a]">
              View History
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-5 px-5">
            {orderAgainProducts.map((product, idx) => (
              <div key={product.id} className="relative w-44 flex-shrink-0 rounded-[24px] overflow-hidden shadow-sm">
                <div className="aspect-[4/3] w-full bg-gray-200">
                  <img
                    src={product.imageUrl || `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80`}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute bottom-2 right-2 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-wider text-[#b81d2a] shadow-sm uppercase">
                  REORDER
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#b81d2a] text-white shadow-xl hover:scale-105 transition-transform z-50">
        <UtensilsCrossed className="h-6 w-6" />
      </button>

      {/* Hide scrollbar styles locally */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
