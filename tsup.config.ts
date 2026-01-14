import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: [
      'api/start.ts',
    ],
    splitting: true,
    sourcemap: true,
    clean: true,
    outDir: 'build',
    format: ['esm', 'cjs'],
    minify: !options.watch,
  }
})
