import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    // En local, /api est redirigé vers l'API Express (server/)
    // API_PROXY permet de viser une autre API locale (ex. http://localhost:4001)
    proxy: { '/api': process.env.API_PROXY || 'http://localhost:4000' },
  },
})
