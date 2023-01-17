import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    globals: true,
    coverage: {
      all: true,
      include: ["packages/*/src"],
      exclude: [
        ...defaultExclude,
        "**/*.spec.*",
        "**/src/**/@types/**",
        "**/src/graphql/resolvers.ts",
        "**/src/**/generated/**",
        "packages/frontend",
      ],
    },
  },
});
