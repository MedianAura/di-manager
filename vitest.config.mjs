import { kitchen } from 'alias-kitchen';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vitest/config';

// process.env.NODE_OPTIONS = '';

export default defineConfig({
  plugins: [
    AutoImport({
      dts: 'src/typings/auto-imports.d.ts',
      imports: ['vitest'],
    }),
  ],
  resolve: {
    alias: kitchen({ recipe: 'vite' }),
  },
  test: {
    cache: true,
    coverage: {
      all: true,
      exclude: ['src/**/entry.ts', 'src/**/index.ts', 'src/**/*.d.ts'],
      include: ['src/**/*.*'],
      provider: 'v8',
    },
    // setupFiles: './tests/unit/vitest.setup.ts',
    globals: true,
    include: ['./tests/unit/**/*.spec.ts'],
  },
});
