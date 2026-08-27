import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Moonlit Violet Vault',
    short_name: 'Vault',
    description: 'A personal media sanctuary',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#8b5cf6',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
      },
    ],
  };
}
