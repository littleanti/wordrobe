/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/wordrobe/',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'logo.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Wordrobe',
        short_name: 'Wordrobe',
        lang: 'ko',
        description: '내가 닮고 싶은 말의 옷장',
        theme_color: '#6366f1',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/wordrobe/',
        scope: '/wordrobe/',
        icons: [
          { src: '/wordrobe/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/wordrobe/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallback: '/wordrobe/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: { host: '0.0.0.0', port: 4122, strictPort: true },
});
