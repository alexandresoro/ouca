import * as _ from "lodash";
import * as mysql from "mysql";
import { buildArgRegexFromKey } from "../utils/utils";

export class SqlConnection {
  public static getInstance(): SqlConnection {
    if (!SqlConnection.instance.connection) {
      SqlConnection.instance.connection = createDatabaseConnection();
    }
    return SqlConnection.instance;
  }

  public static query(
    query: string,
    callback?: mysql.queryCallback
  ): mysql.Query {
    return this.getInstance().connection.query(query, callback);
  }

  private static instance: SqlConnection = new SqlConnection();

  private connection: mysql.Connection;

  private constructor() {
    if (SqlConnection.instance) {
      throw new Error(
        "Error: Instantiation failed: Use SingletonClass.getInstance() instead of new."
      );
    }
    SqlConnection.instance = this;
  }
}

const DEFAULT_DB_HOST: string = "127.0.0.1";

const DEFAULT_DB_PORT: number = 3306;

const DEFAULT_DB_USER: string = "basenaturaliste";

const DEFAULT_DB_PASSWORD: string = "basenaturaliste";

const DEFAULT_DATABASE_NAME = "basenaturaliste";

const DB_HOST_ARG: string = "-dbHost";

const DB_PORT_ARG: string = "-dbPort";

const DB_USER_ARG: string = "-dbUser";

const DB_PASSWORD_ARG: string = "-dbPassword";

const ARG_KEY_VALUE_DELIMITER: string = "=";

/**
 * Returns the connection configuration of the database to connect to.
 * It returns the default configuration, or a configuration that can be overriden by argv params/
 * - dbUser
 * - dbPort
 * - dbUser
 * - dbPassword
 */
function getSqlConnectionConfiguration(): mysql.ConnectionConfig {
  let host = DEFAULT_DB_HOST;
  let port = DEFAULT_DB_PORT;
  let user = DEFAULT_DB_USER;
  let password = DEFAULT_DB_PASSWORD;

  console.log(process.argv);

  const hostRegex = buildArgRegexFromKey(DB_HOST_ARG, ARG_KEY_VALUE_DELIMITER);
  const portRegex = buildArgRegexFromKey(DB_PORT_ARG, ARG_KEY_VALUE_DELIMITER);
  const userRegex = buildArgRegexFromKey(DB_USER_ARG, ARG_KEY_VALUE_DELIMITER);
  const passwordRegex = buildArgRegexFromKey(
    DB_PASSWORD_ARG,
    ARG_KEY_VALUE_DELIMITER
  );

  _.forEach(process.argv, (argValue) => {
    const hostMatch = hostRegex.exec(argValue);
    const portMatch = portRegex.exec(argValue);
    const userMatch = userRegex.exec(argValue);
    const passwordMatch = passwordRegex.exec(argValue);

    if (hostMatch) {
      host = hostMatch[2];
    }

    if (portMatch) {
      port = +portMatch[2];
    }

    if (userMatch) {
      user = userMatch[2];
    }

    if (passwordMatch) {
      password = passwordMatch[2];
    }
  });

  const config: mysql.ConnectionConfig = {
    host,
    port,
    user,
    password,
    database: DEFAULT_DATABASE_NAME,
    multipleStatements: true
  };

  console.log(
    `Database configured with address ${config.host}:${config.port} and user ${
      config.user
    } and password ${config.password} on database "${config.database}"`
  );

  return config;
}

function createDatabaseConnection(): mysql.Connection {
  return mysql.createConnection(getSqlConnectionConfiguration());
}
