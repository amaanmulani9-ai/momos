import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Meghna's Momos",
    short_name: 'Momos',
    description: 'Installable food ordering app with checkout and live order tracking.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#080a10',
    background_color: '#080a10',
    icons: [
      {
        src: '/window.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/next.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Browse Restaurants',
        short_name: 'Restaurants',
        url: '/',
      },
      {
        name: 'Open Cart',
        short_name: 'Cart',
        url: '/cart',
      },
      {
        name: 'Track Orders',
        short_name: 'Orders',
        url: '/profile',
      },
    ],
  };
}
