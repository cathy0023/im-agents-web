import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname || process.cwd(), "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.10.19:8001/',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
