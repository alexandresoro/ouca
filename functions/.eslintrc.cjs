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
};
