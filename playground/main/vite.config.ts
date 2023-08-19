import process from 'node:process'
import path from 'path-browserify'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ElementPlus from 'unplugin-element-plus/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import Inspect from 'vite-plugin-inspect'
import { qiankunMain } from '@baicie/vite-plugin-qiankun'
import config from './src/config/default/vue.custom.config'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    base: config.publicPath,
    resolve: {
      alias: {
        '@/': `${path.join(__dirname, 'src')}/`,
        'path': 'path-browserify',
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/styles/_variables.scss" as *;',
        },
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      ElementPlus({
        useSource: true,
      }),
      Inspect(),
      visualizer({
        open: true,
        gzipSize: true,
      }),
      qiankunMain(),
    ],
    server: {
      cors: true,
      port: 9802,
      open: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      host: '0.0.0.0',
      proxy: {
        '/api/': {
          target: 'http://px.car2.chinahuatong.com.cn:55000',
          changeOrigin: true,
        },
      },
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), '../'],
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name].[hash].js',
          entryFileNames: 'assets/js/[name].[hash].js',
          assetFileNames: 'assets/[ext]/[name].[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('.pnpm'))
                return id.toString().split('node_modules/.pnpm/')[1].split('/')[0].toString()
              else
                return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          },
        },
      },
    },
  }
})
