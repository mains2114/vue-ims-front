import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

// https://vite.dev/config/
export default defineConfig({
    base: './',
    server: {
        host: '127.0.0.1',
        proxy: {
            '^/(api|login|product|inventory)': {
                // context: ['/api', '/login', '/product', '/inventory'],
                target: 'http://127.0.0.1:8000',
                secure: false,
                changeOrigin: true,
            },
        },
    },
    plugins: [vue()],
    resolve: {
        alias: [
            {
                find: 'vue',
                replacement: 'vue/dist/vue.runtime.esm.js'
            },
        ],
    },
})
