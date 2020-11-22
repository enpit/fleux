const { build, transformSync } = require('esbuild');

build({
  entryPoints: ['./src/index.js'],
  format: 'esm',
  outfile: './dist/index.esm.js',
  minify: true,
  sourcemap: 'external',
  loader: { '.js': 'jsx' },
  bundle: true,
  external: ['react'],
}).catch(() => process.exit(1));

build({
  entryPoints: ['./src/index.js'],
  format: 'iife',
  outfile: './dist/index.iife.js',
  minify: true,
  sourcemap: 'external',
  loader: { '.js': 'jsx' },
  bundle: true,
  external: ['react'],
}).catch(() => process.exit(1));

build({
  entryPoints: ['./src/index.js'],
  format: 'cjs',
  outfile: './dist/index.cjs.js',
  minify: false,
  sourcemap: 'external',
  loader: { '.js': 'jsx' },
  bundle: true,
  external: ['react'],
}).catch(() => process.exit(1));
