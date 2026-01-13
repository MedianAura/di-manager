import { defineConfig } from 'eslint/config';
import { createConfig } from '@medianaura/eslint-config';

const config = createConfig({
  ignores: ['build/**/*', 'temp/**/*'],
  testFilePatterns: ['tests/**/*', '**/*.test.ts', '**/*.spec.ts'],
});

export default defineConfig([...config]);
