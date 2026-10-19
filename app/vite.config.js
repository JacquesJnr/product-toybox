import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/product-toybox/app/',
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        style: path.resolve(import.meta.dirname, 'style.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
