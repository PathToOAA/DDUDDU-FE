import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/tour-api": {
        target: "https://apis.data.go.kr",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/tour-api/, ""),
      },
    },
  },
});
