import { defineConfig } from 'vite'
import qiankun from '@baicie/vite-plugin-qiankun'
import react from '@vitejs/plugin-react'

const useDevMode = true

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // useDevMode = true 时不开启热更新
    react(),
    qiankun('reac18', {
      useDevMode
    })
  ],
  base: '/',
  server: {
    port: 7107,
    cors: true
  }
})
