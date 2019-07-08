import * as _ from "lodash";
import * as mariadb from "mariadb";
import * as mysql from "mysql";
import { buildArgRegexFromKey } from "../utils/utils";

export class SqlConnection {
  public static async query(query: string): Promise<mysql.Query> {
    const connection = await this.getConnection();
    return connection.query(query);
  }

  // The current database connection
  private static connection: mysql.Connection | null | undefined;

  private static async getConnection(): Promise<mysql.Connection> {

    // If we already have an existing connection but, the connection is no more valid,
    // we destroy it in order to recreate a new one
    if (this.connection && !(this.connection as any).isValid()) {
      this.connection.destroy();
      this.connection = null;
    }

    // If no valid connection exists, we create a new one
    if (!this.connection) {
      try {
        const connection = await createDatabaseConnection();
        this.connection = connection;
      } catch (error) {
        // If something went wrong during the creation of the connection, we reject the promise
        return Promise.reject(error);
      }
    }
    return this.connection;
  }
}

const DEFAULT_DB_HOST: string = "127.0.0.1";

const DEFAULT_DB_PORT: number = 3306;

const DEFAULT_DB_USER: string = "basenaturaliste";

const DEFAULT_DB_PASSWORD: string = "basenaturaliste";

export const DEFAULT_DATABASE_NAME = "basenaturaliste";

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
export const getSqlConnectionConfiguration = (): mysql.ConnectionConfig => {
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
    multipleStatements: true,
    typeCast: function castField(field, useDefaultTypeCasting) {
      // We only want to cast bit fields that have a single-bit in them. If the field
      // has more than one bit, then we cannot assume it is supposed to be a Boolean.
      if (field.type === "BIT" && (field as any).columnLength === 1) {
        const bytes = field.buffer();

        // A Buffer in Node represents a collection of 8-bit unsigned integers.
        // Therefore, our single "bit field" comes back as the bits '0000 0001',
        // which is equivalent to the number 1.
        return bytes[0] === 1;
      }

      return useDefaultTypeCasting();
    }
  };

  console.log(
    `Database configured with address ${config.host}:${config.port} and user ${
    config.user
    } and password ${config.password} on database "${config.database}"`
  );

  return config;
};

const createDatabaseConnection = async (): Promise<any> => {
  return (mariadb
    .createConnection(getSqlConnectionConfiguration()) as Promise<any>)
    .then((conn) => {
      console.log("Connected to the database: ", (conn as any).serverVersion());
      conn.on("error", (error) => {
        console.log(error);
      });
      return conn;
    })
    .catch((error) => {
      // General connection error
      console.log("The connection to the database has failed with the following error:", error);
      return Promise.reject(error);
    });
};
