import yargs from "yargs";

const ENV_OUCA_PREFIX = "OUCA";

export default yargs.env(ENV_OUCA_PREFIX).options({
  dbHost: { type: "string", default: "127.0.0.1" },
  dbPort: { type: "number", default: 3306 },
  dbUser: { type: "string", default: "basenaturaliste" },
  dbPassword: { type: "string", default: "basenaturaliste" },
  dbName: { type: "string", default: "basenaturaliste" },
  listenAddress: { type: "string", default: "127.0.0.1" },
  listenPort: { type: "number", default: 4000 },
  logLevel: { type: "string", default: "warn" },
  logToFile: { type: "boolean", default: false },
}).parseSync();
