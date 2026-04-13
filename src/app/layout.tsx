import type { Metadata, Viewport } from 'next';
import { Outfit, Playfair_Display } from 'next/font/google';
import '@/app/globals.css';
import AppChrome from '@/components/AppChrome';
import { CartProvider } from '@/lib/store';

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
  title: "Meghna's Momos | Dark Kitchen Delivery",
  description:
    'Premium momos, noodles, pizza, and comfort food delivered fast with WhatsApp-friendly ordering.',
  manifest: '/manifest.webmanifest',
  applicationName: "Meghna's Momos",
  appleWebApp: {
    capable: true,
    title: "Meghna's Momos",
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: "Meghna's Momos",
    description: 'Premium comfort food delivery with a mobile-first ordering flow.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#080a10',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
      <body>
        <CartProvider>
          <AppChrome>{children}</AppChrome>
        </CartProvider>
      </body>
    </html>
  );
}

