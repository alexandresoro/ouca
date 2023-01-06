module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./packages/*/tsconfig.json"],
  },
  root: true,
  ignorePatterns: ["coverage", "dist", "jest.config.*", "functions/"],
};
