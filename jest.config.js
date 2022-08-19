/**
 * @type {import('@jest/types').Config.ProjectConfig}
 */
module.exports = {
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "src/**",
    "!src/graphql/apollo-plugins.ts",
    "!src/graphql/resolvers.ts",
    "!src/graphql/generated/**",
    "!src/model/graphql.ts",
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

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
