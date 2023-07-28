import type { UserConfig } from 'vite'
import qiankun from '../../dist'

// useDevMode 开启时与热更新插件冲突
const useDevMode = true

// https://vitejs.dev/config/
const baseConfig: UserConfig = {
  plugins: [
    qiankun('viteapp', {
      useDevMode,
    }),
  ],
  server: {
    port: 7106,
    cors: true,
  },
}

export default ({ mode }: any) => {
  baseConfig.base = 'http://127.0.0.1:7106/'
  if (mode === 'development')
    baseConfig.base = '/'

  return baseConfig
}
