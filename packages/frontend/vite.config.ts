import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { defaultExclude } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const API_SERVER_URL = env.API_SERVER_URL ?? "http://localhost:4000";

  const enableSentry = env.ENABLE_SENTRY?.toLowerCase() === "true";

  return {
    resolve: {
      alias: {
        "@ou-ca/common": path.resolve(__dirname, "../common/src"),
      },
    },
    build: {
      sourcemap: enableSentry,
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        "/graphql": API_SERVER_URL,
        "/download": API_SERVER_URL,
      },
    },
    plugins: [
      react(),
      ...(enableSentry
        ? [
            sentryVitePlugin({
              include: "./dist",
              url: env.SENTRY_URL,
              injectRelease: false,
              setCommits: {
                auto: true,
              },
              telemetry: false,
            }),
          ]
        : []),
    ],
    test: {
      clearMocks: true,
      globals: true,
      coverage: {
        all: true,
        include: ["src"],
        exclude: [...defaultExclude, "**/*.spec.*", "**/src/**/@types/**", "**/src/gql/**"],
      },
    },
  };
});
