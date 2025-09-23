import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

// https://vite.dev/config/
export default defineConfig({
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
})
