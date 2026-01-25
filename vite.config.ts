
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // Esbuild es nativo de Vite y mucho más rápido
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'icons': ['lucide-react']
        }
      }
    }
  },
  esbuild: {
    // Esto reemplaza las opciones de terser para limpiar el código
    drop: ['console', 'debugger'],
  }
});
