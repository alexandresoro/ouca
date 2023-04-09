import { type Logger } from "pino";
import { createPool } from "slonik";
import { createFieldNameTransformationInterceptor } from "slonik-interceptor-field-name-transformation";
import config from "../config.js";
import { createQueryLoggingInterceptor } from "./slonik-pino-interceptor.js";
import { createResultParserInterceptor } from "./slonik-zod-interceptor.js";

const getSlonikInstance = ({ logger }: { logger: Logger }) => {
  return createPool(config.database.url, {
    interceptors: [
      createFieldNameTransformationInterceptor({ format: "CAMEL_CASE" }),
      createResultParserInterceptor(logger),
      createQueryLoggingInterceptor(logger),
    ],
  });
};

export default getSlonikInstance;
