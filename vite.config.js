import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Toda la configuración externa pertenece al servidor y la carga Node.
  // Vite no necesita variables .env para estas tres vistas.
  envDir: false,
  plugins: [react()],
  server: { proxy: { '/api/': { target: 'http://127.0.0.1:3001', changeOrigin: false } } },
});
