import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: https://www.google.com https://*.gstatic.com https://icons.duckduckgo.com",
  "style-src 'self'",
  "font-src 'self'",
  "script-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
].join('; ')
const headerSecurityPolicy = `${contentSecurityPolicy}; frame-ancestors 'none'`

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.svg', 'boot-theme.js', 'icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'Locker',
        short_name: 'Locker',
        description: 'Local-first personal security vault that works offline.',
        theme_color: '#12110f',
        background_color: '#12110f',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
    {
      name: 'locker-csp',
      apply: 'build',
      transformIndexHtml(html) {
        return html.replace(
          '</head>',
          `  <meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}" />\n  </head>`,
        )
      },
    },
  ],
  preview: {
    headers: {
      'Content-Security-Policy': headerSecurityPolicy,
    },
  },
  test: {
    environment: 'node',
    testTimeout: 30000,
  },
})
