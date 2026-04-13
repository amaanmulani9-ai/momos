'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { fallbackSettings } from '@/lib/customer-data';

export default function WhatsAppButton() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout') || pathname.startsWith('/order') || pathname.startsWith('/contact')) {
    return null;
  }

  return (
    <motion.a
      href={`https://wa.me/${fallbackSettings.whatsapp}?text=${encodeURIComponent("Hello, I want to place an order.")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[96px] right-4 z-30 inline-flex items-center gap-2 rounded-full border border-[#32d272]/30 bg-[linear-gradient(135deg,#1fbe60,#139d53)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(20,157,83,0.35)] lg:bottom-6"
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.35 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">WhatsApp order</span>
    </motion.a>
  );
}

