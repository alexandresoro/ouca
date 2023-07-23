import { type Logger } from "pino";
import { createPool } from "slonik";
import { type DbConfig } from "../config.js";
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
