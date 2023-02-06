module.exports = {
  plugins: ["import", "@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
  rules: {
    "import/no-unresolved": "error",
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/consistent-type-imports": ["warn", { fixStyle: "inline-type-imports" }],
    "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true, destructuredArrayIgnorePattern: "^_" }],
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true, allowBoolean: true }],
  },
  ignorePatterns: ["coverage", "dist", "vite.config.*", ".eslintrc.*", "tsup.config.*"],
};
