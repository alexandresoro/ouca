/**
 * @type {import('@jest/types').Config.ProjectConfig}
 */
module.exports = {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["src/**", "!src/**/@types/**", "!src/graphql/resolvers.ts", "!src/**/generated/**"],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  projects: ["<rootDir>/packages/*"],
};
