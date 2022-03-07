import dotenv from "dotenv";
import path from "path";
import yargs from "yargs";

const ENV_OUCA_PREFIX = "OUCA";

dotenv.config({
  path: path.join(process.cwd(), "..", ".env")
});

export default yargs
  .env(ENV_OUCA_PREFIX)
  .options({
    dbHost: { type: "string", default: "127.0.0.1" },
    dbPort: { type: "number", default: 3306 },
    dbUser: { type: "string", default: "basenaturaliste" },
    dbPassword: { type: "string", default: "basenaturaliste" },
    dbName: { type: "string", default: "basenaturaliste" },
    signupsAllowed: { type: "boolean", default: false },
    defaultAdminPassword: { type: "string" },
    listenAddress: { type: "string", default: "127.0.0.1" },
    listenPort: { type: "number", default: 4000 },
    logLevel: { type: "string", default: "warn" },
    logToFile: { type: "boolean", default: false },
    jwtSigningKey: { type: "string" },
    jwtCookieSameSite: { type: "boolean", default: true },
    jwtCookieSecure: { type: "boolean", default: true }
  })
  .parseSync();
