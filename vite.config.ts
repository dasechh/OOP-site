import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',  // Папка для сборки
    emptyOutDir: true,  // Очистить папку перед новой сборкой
  },
  server: {
    port: 0,  // Порт для сервера
    open: true,  // Автоматически открывает страницу в браузере
  },
});
