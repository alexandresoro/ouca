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
};
