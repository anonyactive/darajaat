import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Darajaat - Syllabus Manager',
        short_name: 'Darajaat',
        description: 'Syllabus management app in Urdu',
        theme_color: '#4f46e5',
        background_color: '#1e1e2f',
        display: 'standalone',
        dir: 'rtl',
        lang: 'ur',
        icons: []
      }
    })
  ],
})
