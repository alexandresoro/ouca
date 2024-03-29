import path from "node:path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
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
        "@components": path.resolve(__dirname, "./src/components"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@typings": path.resolve(__dirname, "./src/@types"),
        "@utils": path.resolve(__dirname, "./src/utils"),
      },
    },
    build: {
      sourcemap: enableSentry ? "hidden" : false,
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        "/api/v1": API_SERVER_URL,
        "/download": API_SERVER_URL,
        "/uploads": API_SERVER_URL,
        "/import-status": API_SERVER_URL,
      },
    },
    plugins: [
      react(),
      sentryVitePlugin({
        disable: !enableSentry,
        url: env.SENTRY_URL,
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        release: {
          name: env.SENTRY_RELEASE,
          // Disabled while testing GlitchTip as it does not seem to work properly
          // Probably because of GlitchTip does not link commits to releases at all
          // setCommits: {
          //   auto: true,
          // },
          // GlitchTip does not seem happy with the new source map format
          uploadLegacySourcemaps: {
            paths: ["**/assets/*"],
            ext: ["js", "map"],
            urlPrefix: "~/assets",
          },
        },
        sourcemaps: {
          filesToDeleteAfterUpload: "**/assets/*.js.map",
        },
        telemetry: false,
      }),
    ],
    test: {
      clearMocks: true,
      globals: true,
      coverage: {
        all: true,
        include: ["src"],
        exclude: [...defaultExclude, "**/*.spec.*", "**/src/**/@types/**"],
      },
    },
  };
});
