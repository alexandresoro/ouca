/**
 * @type {import('@jest/types').Config.ProjectConfig}
 */
module.exports = {
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  displayName: "backend",

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  // moduleNameMapper: {},
  moduleNameMapper: {
    "^csv-parse/sync": "<rootDir>/node_modules/csv-parse/dist/cjs/sync.cjs",
  },

  // A list of paths to directories that Jest should use to search for files in
  roots: ["src"],

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};
