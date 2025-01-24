import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend', // Указываем корневую директорию
  build: {
    outDir: '../dist', // Путь для выходных файлов относительно директории root
    emptyOutDir: true,
  },
  server: {
    port: 0,
    open: true,
  },
});
