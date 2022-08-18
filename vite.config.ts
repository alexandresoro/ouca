import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";

const API_SERVER_URL = "http://localhost:4000";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/graphql": API_SERVER_URL,
      "/download": API_SERVER_URL
    }
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true
      }
    })
  ]
});
