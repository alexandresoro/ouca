module.exports = {
  plugins: ["import", "@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
  rules: {
    "import/no-unresolved": "error",
    "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
    "@typescript-eslint/consistent-type-imports": ["warn", { fixStyle: "inline-type-imports" }],
    "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true, destructuredArrayIgnorePattern: "^_" }],
    "@typescript-eslint/prefer-nullish-coalescing": [
      "error",
      {
        ignoreTernaryTests: true,
        ignoreConditionalTests: true,
        ignoreMixedLogicalExpressions: true,
      },
    ],
  },
  ignorePatterns: ["coverage", "dist", "vite.config.*", ".eslintrc.*"],
};
