/**
 * @type {import('@jest/types').Config.ProjectConfig}
 */
module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest"
  }
};
