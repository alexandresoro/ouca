import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    resolve: {
      alias: {
        "@ou-ca/common": path.resolve(__dirname, "../common/src"),
      },
    },
    plugins: [
      react(),
      ...(env.SENTRY_URL
        ? [
            sentryVitePlugin({
              url: env.SENTRY_URL,
              telemetry: false,
              release: {
                name: env.CF_PAGES_COMMIT_SHA,
              },
            }),
          ]
        : []),
    ],
  };
});
