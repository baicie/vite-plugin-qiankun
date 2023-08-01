import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qinkun from '../../packages/vite/dist/index.mjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), qinkun('vue3', { useDevMode: true })],
  server: {
    port: 5174
  }
})
