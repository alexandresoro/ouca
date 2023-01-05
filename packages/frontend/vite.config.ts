import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const API_SERVER_URL = env.API_SERVER_URL ?? "http://localhost:4000";

  return {
    resolve: {
      alias: {
        "@ou-ca/common": path.resolve(__dirname, "../common/src"),
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        "/graphql": API_SERVER_URL,
        "/download": API_SERVER_URL,
      },
    },
    plugins: [react()],
  };
});
