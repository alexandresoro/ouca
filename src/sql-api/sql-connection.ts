import * as mariadb from "mariadb";
import { logger } from "../utils/logger";
import { options } from "../utils/options";

export const DEFAULT_DATABASE_NAME = "basenaturaliste";

/**
 * Returns the connection configuration of the database to connect to.
 * It returns the default configuration, or a configuration that can be overriden by argv params/
 * - dbUser
 * - dbPort
 * - dbUser
 * - dbPassword
 */
export const getSqlConnectionConfiguration = (): mariadb.ConnectionConfig => {

  const config: mariadb.ConnectionConfig = {
    host: options.dbHost,
    port: options.dbPort,
    user: options.dbUser,
    password: options.dbPassword,
    database: DEFAULT_DATABASE_NAME,
    multipleStatements: true,
    dateStrings: true,
    typeCast: function castField(field, useDefaultTypeCasting) {
      // We only want to cast bit fields that have a single-bit in them. If the field
      // has more than one bit, then we cannot assume it is supposed to be a Boolean.
      if (field.type === mariadb.Types.BIT && field.columnLength === 1) {
        const bytes = field.buffer();

        // A Buffer in Node represents a collection of 8-bit unsigned integers.
        // Therefore, our single "bit field" comes back as the bits '0000 0001',
        // which is equivalent to the number 1.
        return bytes[0] === 1;
      }

      return useDefaultTypeCasting();
    }
  };

  logger.info(
    `Database configured with address ${config.host}:${config.port} and user ${config.user} on database "${config.database}"`
  );

  return config;
};

const createDatabaseConnection = async (): Promise<mariadb.Connection> => {
  return mariadb
    .createConnection(getSqlConnectionConfiguration())
    .then((conn) => {
      logger.info(`Connected to the database: ${conn.serverVersion()}`);
      conn.on("error", (error) => {
        logger.error(error);
      });
      return conn;
    })
    .catch((error) => {
      // General connection error
      logger.error(
        "The connection to the database has failed with the following error:",
        error
      );
      return Promise.reject(error);
    });
};

export class SqlConnection {
  public static async query<T>(query: string): Promise<T> {
    const connection = await this.getConnection();
    return connection.query(query);
  }

  // The current database connection
  private static connection: mariadb.Connection | null | undefined;

  private static async getConnection(): Promise<mariadb.Connection> {
    // If we already have an existing connection but, the connection is no more valid,
    // we destroy it in order to recreate a new one
    if (this.connection && !this.connection.isValid()) {
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
