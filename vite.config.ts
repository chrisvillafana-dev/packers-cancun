import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        /* ==========================================
           SITIO PÚBLICO
        ========================================== */

        main: resolve(__dirname, "index.html"),

        partidos: resolve(
          __dirname,
          "partidos.html"
        ),

        reels: resolve(
          __dirname,
          "reels.html"
        ),

        gallery: resolve(
          __dirname,
          "gallery.html"
        ),

        categorias: resolve(
          __dirname,
          "categorias.html"
        ),

        stats: resolve(
          __dirname,
          "stats.html"
        ),

        unete: resolve(
          __dirname,
          "unete.html"
        ),


        /* ==========================================
           CMS
        ========================================== */

        adminLogin: resolve(
          __dirname,
          "admin/login.html"
        ),

        adminDashboard: resolve(
          __dirname,
          "admin/dashboard.html"
        ),

        adminNews: resolve(
          __dirname,
          "admin/news.html"
        ),

        adminMatches: resolve(
          __dirname,
          "admin/matches.html"
        ),

        adminReels: resolve(
          __dirname,
          "admin/reels.html"
        ),

        adminGallery: resolve(
          __dirname,
          "admin/gallery.html"
        ),

        adminPlayers: resolve(
          __dirname,
          "admin/players.html"
        ),

        adminCategories: resolve(
          __dirname,
          "admin/categories.html"
        ),

        adminRequests: resolve(
          __dirname,
          "admin/requests.html"
        ),

        adminUsers: resolve(
          __dirname,
          "admin/users.html"
        ),

        adminSettings: resolve(
          __dirname,
          "admin/settings.html"
        )
      }
    }
  }
});