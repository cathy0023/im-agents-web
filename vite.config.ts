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
      '/webapi': {
        target: 'https://jirui.test.mgvai.cn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/webapi/, '/webapi')
      }
    }
  }
})
