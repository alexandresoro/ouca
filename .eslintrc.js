module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./functions/tsconfig.json", "./packages/*/tsconfig.json"],
  },
  root: true,
  ignorePatterns: ["coverage", "dist", "vite.config.*"],
};
