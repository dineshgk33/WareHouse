import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/_functions': {
        target: 'https://www.haatza.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
