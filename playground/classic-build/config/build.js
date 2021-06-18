const path = require('path');
const root = path.resolve(__dirname, '..');

module.exports = {
  esbuildOptions: {
    entryPoints: [path.join(root, 'index.tsx')],
    sourcemap: true,
    platform: 'browser',
    write: false,
    bundle: true,
    outdir: path.join(root, 'dist'),
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    minify: true,
    loader: {
      '.svg': 'file',
    },
    entryNames: '[name]-[hash]',
    assetNames: 'assets/[name]-[hash]',
  },
  htmlOptions: {
    entry: path.join(root, 'index.ejs'),
    minify: true,
  },
};
