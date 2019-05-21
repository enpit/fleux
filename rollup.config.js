import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';

import pkg from './package.json';

const config = [{
    input: 'src/index.js',
    output: {
        format: 'umd',
        name: pkg.name,
        file: pkg.browser,
        exports: 'named',
        sourcemap: true,
        globals: {
            react: 'React'
        }
    },
    plugins: [
        typescript(),
        babel(),
        resolve(),
        commonjs()
    ],
    external: [
        'react'
    ]
}, {
    input: 'src/index.js',
    output: {
        format: 'es',
        file: pkg.module,
        sourcemap: true
    },
    plugins: [
        typescript(),
        babel(),
        resolve(),
        commonjs()
    ],
    external: [
        'react'
    ]
}, {
    input: 'src/index.js',
    output: {
        format: 'cjs',
        file: pkg.main,
        sourcemap: true
    },
    plugins: [
        typescript(),
        babel(),
        resolve(),
        commonjs()
    ],
    external: [
        'react'
    ]
}];

export default config;
