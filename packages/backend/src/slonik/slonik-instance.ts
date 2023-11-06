import { type DbConfig } from "@domain/config/database-config.js";
import { type Logger } from "pino";
import { createPool } from "slonik";
import { createFieldNameTransformationToCamelcaseInterceptor } from "./slonik-fieldname-to-camelcase-interceptor.js";
import { createQueryLoggingInterceptor } from "./slonik-pino-interceptor.js";
import { createResultParserInterceptor } from "./slonik-zod-interceptor.js";

const getSlonikInstance = ({ logger, dbConfig }: { dbConfig: DbConfig; logger: Logger }) => {
  return createPool(dbConfig.url, {
    interceptors: [
      createFieldNameTransformationToCamelcaseInterceptor(),
      createResultParserInterceptor(logger),
      createQueryLoggingInterceptor(logger),
    ],
  });
};

export default getSlonikInstance;
