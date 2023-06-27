import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
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
