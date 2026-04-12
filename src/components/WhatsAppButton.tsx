'use client';

import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { SHOP_INFO } from '@/lib/data';

export default function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent("Hi! I'd like to order some momos 🥟")}`}
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-float-btn"
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl text-white font-semibold text-sm"
      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 8px 32px rgba(37,211,102,0.4)' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Order on WhatsApp"
    >
      <MessageCircle className="w-5 h-5" fill="white" />
      <span className="hidden sm:inline">Order on WhatsApp</span>
    </motion.a>
  );
}
