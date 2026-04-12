import type { Metadata } from 'next';
import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/store';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppButton from '@/components/WhatsAppButton';
import AIChatBot from '@/components/AIChatBot';
import BottomNav from '@/components/BottomNav';
import LiveOrders from '@/components/LiveOrders';
import SpinWheel from '@/components/SpinWheel';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: "Meghna's Momos — Handcrafted Dumplings Delivered Fresh",
  description:
    "Order the freshest steam, fried, and kurkure momos in Noida. Veg & non-veg options. Fast delivery. Order on WhatsApp or online.",
  keywords: 'momos, dumplings, noida, food delivery, street food, veg momos, chicken momos',
  openGraph: {
    title: "Meghna's Momos",
    description: 'Handcrafted Dumplings Delivered Fresh',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
      <body>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="pb-16">{children}</main>
          <BottomNav />
          <LiveOrders />
          <SpinWheel />
          <WhatsAppButton />
          <AIChatBot />
        </CartProvider>
      </body>
    </html>
  );
}
