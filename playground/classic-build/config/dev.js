const path = require('path');
const root = path.resolve(__dirname, '..');

module.exports = {
  esbuildOptions: {
    entryPoints: [path.join(root, 'index.tsx')],
    sourcemap: true,
    platform: 'browser',
    bundle: true,
    outdir: path.join(root, 'dev-www'),
    define: {
      'process.env.NODE_ENV': '"development"',
    },
    loader: {
      '.svg': 'file',
    },
  },
  serveOptions: {
    servedir: path.join(root, 'dev-www'),
  }
};
