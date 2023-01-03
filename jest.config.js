/**
 * @type {import('@jest/types').Config.ProjectConfig}
 */
module.exports = {
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  displayName: "common",

  // A list of paths to directories that Jest should use to search for files in
  roots: ["src"],

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};
