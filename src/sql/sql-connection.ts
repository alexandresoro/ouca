import * as mariadb from "mariadb";
import { logger } from "../utils/logger";
import options from "../utils/options";

/**
 * Returns the connection configuration of the database to connect to.
 */
export const getSqlConnectionConfiguration = (): mariadb.ConnectionConfig => {

  const config: mariadb.ConnectionConfig = {
    host: options.dbHost,
    port: options.dbPort,
    user: options.dbUser,
    password: options.dbPassword,
    database: options.dbName,
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
    `Database connection is configured to target address ${config.host}:${config.port} with user ${config.user} on database "${config.database}"`
  );

  return config;
};

const mariaDbPool = mariadb.createPool(getSqlConnectionConfiguration());

export const SqlConnection = {
  async query<T>(query: string): Promise<T> {
    logger.debug(`Executing SQL query : 
    ${query}`);
    return (mariaDbPool.query(query) as Promise<T>).catch((error) => {
      logger.error(
        "The connection to the database has failed with the following error:",
        error
      );
      return Promise.reject(error);
    });
  }
} as const;
