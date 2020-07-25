import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import clear from 'rollup-plugin-clear';
import { inputs } from './rollup-common.js';
import { importMetaUrlAssets } from './rollup-plugin-import-meta-url-assets.js';

const SOURCE_DIR = 'src';
const OUTPUT_DIR = `cdn/split-raw`;

export default {
  input: inputs(SOURCE_DIR, (file) => {
    const { name } = path.parse(file);
    return [name, file];
  }),
  output: {
    dir: OUTPUT_DIR,
    sourcemap: true,
    // We don't need the hash in this situation
    assetFileNames: 'assets/[name].[ext]',
  },
  preserveModules: true,
  treeshake: false,
  plugins: [
    clear({
      targets: [OUTPUT_DIR],
    }),
    importMetaUrlAssets({
      // Let's assume we don't have import.meta.url assets in our deps to speed up things
      exclude: 'node_modules/**',
    }),
    json(),
    // teaches Rollup how to find external modules (bare imports)
    resolve(),
    // convert CommonJS modules to ES6, so they can be included in a Rollup bundle
    commonjs(),
  ],
};
