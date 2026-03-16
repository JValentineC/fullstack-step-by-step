/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],

    // For GitHub Pages the app lives at https://<user>.github.io/<repo>/
    // Set VITE_BASE in .env.production to "/<repo>/" (e.g. "/fullstack-step-by-step/").
    // Falls back to "/" for local development.
    base: env.VITE_BASE ?? '/',

    server: {
      proxy: {
        '/api': 'http://localhost:4000',
      },
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }
})
