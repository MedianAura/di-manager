import { createRequire } from 'node:module';
import clear from 'rollup-plugin-clear';
import execute from 'rollup-plugin-shell';
import ts from 'rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

const require = createRequire(import.meta.url);
const packageJSON = require('./package.json');
let commands = [];

if (process.env.BUILD === 'development') {
  commands = [`delay 1 && yalc publish --push --changed`];
}

const plugins = [
  clear({
    targets: ['dist'],
    watch: true,
  }),
  json(),
  ts({
    transpiler: 'swc',
    swcConfig: {
      sourceMaps: true,
      inlineSourcesContent: true,
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: false,
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
        target: 'es2015',
        loose: true,
        minify: {
          compress: false,
          mangle: false,
        },
      },
    },
  }),
  resolve(),
  commonjs(),
  execute({ commands: commands, hook: 'closeBundle' }),
];

const dependencies = ['tslib'];
dependencies.push(...Object.keys(packageJSON.peerDependencies).map((d) => d), ...Object.keys(packageJSON.devDependencies).map((d) => d));

export default [
  {
    cache: false,
    context: 'this',
    input: './src/index.ts',
    external: dependencies,
    output: [
      {
        format: 'cjs',
        file: packageJSON.main,
        sourcemap: process.env.BUILD === 'development' ? 'inline' : false,
        inlineDynamicImports: true,
      },
      {
        format: 'esm',
        file: packageJSON.module,
        sourcemap: process.env.BUILD === 'development' ? 'inline' : false,
        inlineDynamicImports: true,
      },
    ],
    plugins: plugins,
  },
];
