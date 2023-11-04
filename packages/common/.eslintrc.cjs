module.exports = {
  root: true,
  extends: ["@ou-ca"],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
  overrides: [
    {
      files: ["*.spec.ts"],
      rules: {
        // Disable floating promises warnings for native node test runner
        // See https://github.com/typescript-eslint/typescript-eslint/issues/5231
        "@typescript-eslint/no-floating-promises": "off",
      },
    },
  ],
};
