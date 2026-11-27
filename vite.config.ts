import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [],
        manifest: {
          id: '/',
          name: 'Surah Al-Baqarah',
          short_name: 'Surah Al-Baqarah',
          description:
            'تطبيق قراءة سورة البقرة كاملة بالرسم العثماني على تسع صفحات أفقية بتصميم زهرّي باستيل وآيات ملوّنة بدون اتصال بالإنترنت.',
          lang: 'ar',
          dir: 'rtl',
          theme_color: '#F2F2F7',
          background_color: '#F2F2F7',
          display: 'standalone',
          orientation: 'any',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          navigateFallback: null,
          globPatterns: [
            '**/*.{js,css,ico,svg,woff2}',
            'favicon.png',
            'apple-touch-icon.png',
            'app-emblem.png',
            'lily-emblem.png',
          ],
          globIgnores: ['**/assets/aistudio/**'],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/everyayah\.com\/data\/.*\.mp3$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'quran-audio-cache',
                expiration: {
                  maxEntries: 1200,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcAssets = path.resolve(import.meta.dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    build: {
      target: ['es2020', 'safari15'],
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      host: '0.0.0.0',
      allowedHosts: true as const,
    },
  };
});
