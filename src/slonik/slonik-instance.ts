import { type Logger } from "pino";
import { createPool } from "slonik";
import { createFieldNameTransformationInterceptor } from "slonik-interceptor-field-name-transformation";
import config from "../config";
import { createQueryLoggingInterceptor } from "./slonik-pino-interceptor";
import { createResultParserInterceptor } from "./slonik-zod-interceptor";

const getSlonikInstance = ({ logger }: { logger: Logger }) => {
  return createPool(config.database.url, {
    interceptors: [
      createFieldNameTransformationInterceptor({ format: "CAMEL_CASE" }),
      createResultParserInterceptor(),
      createQueryLoggingInterceptor(logger),
    ],
  });
};

export default getSlonikInstance;
