import { resolve } from 'path'

export default {
    root: 'src/',
    publicDir: '../static/',
    base: './',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                admin: resolve(__dirname, 'src/admin/index.html'),
            },
        },
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    },
    server: {
        host: true,
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
    },
}