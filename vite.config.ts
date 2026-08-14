import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Joga Bonito FC',
        short_name: 'Joga Bonito',
        description: 'App oficial para la gestión del club Joga Bonito FC.',
        theme_color: '#102a43',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: 'https://i.pinimg.com/736x/e5/a4/07/e5a407aea70fd07ffcdd7cc87c4daace.jpg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://i.pinimg.com/736x/e5/a4/07/e5a407aea70fd07ffcdd7cc87c4daace.jpg',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});