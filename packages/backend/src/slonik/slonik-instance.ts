import { type Logger } from "pino";
import { createPool } from "slonik";
import { createFieldNameTransformationInterceptor } from "slonik-interceptor-field-name-transformation";
import { type DbConfig } from "../config.js";
import { createQueryLoggingInterceptor } from "./slonik-pino-interceptor.js";
import { createResultParserInterceptor } from "./slonik-zod-interceptor.js";

const getSlonikInstance = ({ logger, dbConfig }: { dbConfig: DbConfig; logger: Logger }) => {
  return createPool(dbConfig.url, {
    interceptors: [
      createFieldNameTransformationInterceptor({ format: "CAMEL_CASE" }),
      createResultParserInterceptor(logger),
      createQueryLoggingInterceptor(logger),
    ],
  });
};

export default getSlonikInstance;
