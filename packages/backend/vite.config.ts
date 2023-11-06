import path from "node:path";
import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@ou-ca/common": path.resolve(__dirname, "../common/src"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
    },
  },
  test: {
    env: {
      OIDC_ISSUER: "",
      OIDC_CLIENT_ID: "",
      OIDC_CLIENT_SECRET: "",
    },
    clearMocks: true,
    globals: true,
    coverage: {
      all: true,
      include: ["src"],
      exclude: [...defaultExclude, "**/*.spec.*", "**/src/**/@types/**"],
    },
  },
});
