import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import glsl from 'vite-plugin-glsl'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          vendor: ['gsap', 'lodash']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'views': resolve(__dirname, './src/js/views'),
      'shaders': resolve(__dirname, './src/js/shaders')
    }
  },
  plugins: [
    glsl(),
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  optimizeDeps: {
    include: ['three']
  }
}) 