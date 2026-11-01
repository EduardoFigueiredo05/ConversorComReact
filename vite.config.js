import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Separa o Recharts do código da aplicação para melhor cache no navegador.
        manualChunks: {
          charts: ['recharts'],
        },
      },
    },
  },
});
