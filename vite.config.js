import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "build",
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
})
