import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/helper.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: './dist',
  dts: true,
  external: ['cheerio'],
  format: ['cjs', 'esm'],
})
