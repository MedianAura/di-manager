import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/index.{js,ts}'],
  ignore: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.{js,ts,mjs,cjs,mts,cts}'],
  project: ['src/**/*.{js,ts}'],
};

export default config;
