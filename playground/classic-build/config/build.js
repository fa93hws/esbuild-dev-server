const path = require('path');
const fs = require('fs');
require('ts-node').register({
  project: path.join(
    __dirname,
    '..',
    '..',
    '..',
    'tsconfig.json',
  ),
  transpileOnly: true,
});

const { htmlPluginFactory } = require('../../../src/html-plugin/html-plugin');
const root = path.resolve(__dirname, '..');

module.exports = {
  esbuildOptions: {
    entryPoints: [path.join(root, 'index.tsx')],
    sourcemap: true,
    platform: 'browser',
    bundle: true,
    outdir: path.join(root, 'dist'),
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    minify: true,
    loader: {
      '.svg': 'file',
      '.png': 'file',
    },
    entryNames: '[name]-[hash]',
    assetNames: 'assets/[name]-[hash]',
    plugins: [
      htmlPluginFactory({
        template: fs.readFileSync(path.join(root, 'index.ejs')),
        minify: true,
        output: path.join(root, 'dist', 'index.html'),
      }),
    ],
  }
};
