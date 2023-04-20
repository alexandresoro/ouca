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
              // Release 0.6.0 fixes injection but still seem to need this for injecting the release
              releaseInjectionTargets: /src\/index\.tsx$/,
              uploadSourceMaps: false,
              telemetry: false,
              release: env.CF_PAGES_COMMIT_SHA,
            }),
          ]
        : []),
    ],
  };
});
