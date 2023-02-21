module.exports = {
  root: true,
  plugins: ["react"],
  extends: ["@ou-ca", "plugin:react/jsx-runtime"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
    es2021: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "packages/*/tsconfig.json",
      },
    },
    react: {
      version: "detect",
    },
  },
  ignorePatterns: ["src/gql/", "tailwind.config.*"],
  rules: {
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
  },
};
