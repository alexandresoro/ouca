module.exports = {
  root: true,
  extends: ["@ou-ca"],
  parserOptions: {
    project: ["./tsconfig.json"],
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
    tsconfigRootDir: __dirname,
  },
  settings: {
    "import/resolver": {
      typescript: {},
      node: true,
    },
  },
  ignorePatterns: ["src/application/jobs/**/*-sandboxed.js"],
  overrides: [
    {
      files: ["*.test.ts"],
      rules: {
        // Disable floating promises warnings for native node test runner
        // See https://github.com/typescript-eslint/typescript-eslint/issues/5231
        "@typescript-eslint/no-floating-promises": "off",
      },
    },
  ],
};
