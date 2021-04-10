import yargs from "yargs";

export const options = yargs.options({
  dbHost: { type: "string", default: "127.0.0.1" },
  dbPort: { type: "number", default: 3306 },
  dbUser: { type: "string", default: "basenaturaliste" },
  dbPassword: { type: "string", default: "basenaturaliste" },
  dbName: { type: "string", default: "basenaturaliste" },
  listenAddress: { type: "string", default: "127.0.0.1" },
  listenPort: { type: "number", default: 4000 },
  logLevel: { type: "string", default: "warn" },
  logToFile: { type: "boolean", default: false },
}).argv;