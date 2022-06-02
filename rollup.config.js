/* eslint-env node */

import fs from 'fs'
import path from 'path'

import {terser} from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import {sizeSnapshot} from 'rollup-plugin-size-snapshot'

const {version, license, name} = require('./package.json')
const licenseData = fs.readFileSync(path.join(process.cwd(), 'LICENSE.md'), {
    encoding: 'utf-8',
})

const bannerPlugin = {
    banner: `/**
 * @license ${name} ${version}
 * ${licenseData.split('\n', 1)}
 * License: ${license}
 */`,
}

const exportFormat = format => ({
    input: 'src/frenchkiss.ts',
    output: {
        name,
        file: `dist/frenchkiss.${format}.js`,
        format,
        sourcemap: process.env.ENVIRONMENT === 'DEV',
    },
    plugins: [
        bannerPlugin,
        typescript(),
        process.env.ENVIRONMENT !== 'DEV' &&
            terser({
                ecma: '2015',
                toplevel: true,
                mangle: {
                    eval: true,
                    module: true,
                    toplevel: true,
                    safari10: true,
                },
                compress: {
                    arguments: true,
                    booleans_as_integers: true,
                    drop_console: true,
                    hoist_funs: true,
                    hoist_vars: true,
                    module: true,
                    pure_getters: true,
                    keep_fargs: false,
                    passes: 3,
                },
                output: {
                    comments: /@license/,
                },
            }),
        sizeSnapshot(),
    ].filter(v => v),
    external: ['src/compiler.ts'],
})

export default ['umd', 'cjs', 'esm'].map(exportFormat)
