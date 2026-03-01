import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // For GitHub Pages the app lives at https://<user>.github.io/<repo>/
  // Set VITE_BASE in .env.production to "/<repo>/" (e.g. "/DevLog/").
  // Falls back to "/" for local development.
  base: process.env.VITE_BASE ?? '/',

  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
