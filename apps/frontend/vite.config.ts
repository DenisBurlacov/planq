import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@appTypes': path.resolve(__dirname, 'src/types'),
      '@ws': path.resolve(__dirname, 'src/ws'),
      '@locales': path.resolve(__dirname, 'src/locales'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@constants': path.resolve(__dirname, 'src/constants'),
    },
  },
  server: {
    port: 3000,
  },
});
