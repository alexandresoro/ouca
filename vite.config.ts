import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const API_SERVER_URL = env.API_SERVER_URL ?? "http://localhost:4000";

  return {
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
