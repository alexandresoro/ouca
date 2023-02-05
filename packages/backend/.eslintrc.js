module.exports = {
  root: true,
  extends: ["@ou-ca"],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "packages/*/tsconfig.json",
      },
      node: true,
    },
  },
  ignorePatterns: ["generated", "scripts/"],
};
