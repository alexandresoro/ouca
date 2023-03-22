import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { defaultExclude } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const API_SERVER_URL = env.API_SERVER_URL ?? "http://localhost:4000";

  return {
    resolve: {
      alias: {
        "@ou-ca/common": path.resolve(__dirname, "../common/src"),
      },
    },
    build: {
      sourcemap: !!env.SENTRY_URL,
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
      ...(env.SENTRY_URL
        ? [
            sentryVitePlugin({
              include: "./dist",
              url: env.SENTRY_URL,
              // https://github.com/getsentry/sentry-javascript-bundler-plugins/issues/182
              releaseInjectionTargets: /src\/index\.tsx$/,
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
