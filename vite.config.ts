import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Replace 'anas-online-shop' with your actual repository name
  base: '/anas-online-shop/', 
  build: {
    outDir: 'dist',
  }
})
