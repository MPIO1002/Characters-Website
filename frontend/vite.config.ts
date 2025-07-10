import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/thuvientuong/',
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 3001,
    host: true,
    strictPort: true,
    cors: true,
    allowedHosts: ['mhgh.ggo.vn'],
  }
})

