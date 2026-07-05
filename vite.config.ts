import { defineConfig } from "vite";
import { resolve } from "path";

// Sitio multipágina: cada pestaña del menú es su propio .html de entrada.
// Vite compila TypeScript, empaqueta el CSS y optimiza todo en /dist al hacer build.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        partidos: resolve(__dirname, "partidos.html"),
        reels: resolve(__dirname, "reels.html"),
        categorias: resolve(__dirname, "categorias.html"),
        stats: resolve(__dirname, "stats.html"),
        unete: resolve(__dirname, "unete.html"),
      },
    },
  },
});
