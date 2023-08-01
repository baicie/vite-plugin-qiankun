import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import qinkun from '../../packages/vite/dist/index.mjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    qinkun('react',{useDevMode:true})
  ],
  server:{
    port:5173
  }
})
