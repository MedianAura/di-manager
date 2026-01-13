import { defineConfig } from 'eslint/config';
import { configs } from 'eslint-plugin-perfectionist';
import path from 'node:path';
import url from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import { createConfig } from '@medianaura/eslint-config';

// Create a compat instance
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname, // Required for correct resolution of plugins/configs
});

const config = createConfig({
  ignores: ['build/**/*', 'temp/**/*'],
  testFilePatterns: ['tests/**/*', '**/*.test.ts', '**/*.spec.ts'],
});

export default defineConfig([
  ...config,

  configs['recommended-alphabetical'],
  {
    rules: {
      'perfectionist/sort-imports': 'off',
    },
  },

  ...compat.config({
    plugins: ['code-complete'],
    rules: {
      'code-complete/lowFunctionCohesion': 'error',
    },
  }),

  {
    files: ['src/**/*.ts'],
    rules: {
      complexity: ['error', { max: 5 }],
      'max-lines-per-function': ['error', { max: 20 }],
    },
  },
]);
