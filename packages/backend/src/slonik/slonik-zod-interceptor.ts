import { type Logger } from "pino";
import { type Interceptor, type QueryResultRow, SchemaValidationError } from "slonik";

export const createResultParserInterceptor = (logger: Logger): Interceptor => {
  return {
    // If you are not going to transform results using Zod, then you should use `afterQueryExecution` instead.
    // Future versions of Zod will provide a more efficient parser when parsing without transformations.
    // You can even combine the two – use `afterQueryExecution` to validate results, and (conditionally)
    // transform results as needed in `transformRow`.
    transformRow: (executionContext, actualQuery, row) => {
      const { resultParser } = executionContext;

      if (!resultParser) {
        return row;
      }

      const validationResult = resultParser.safeParse(row);

      if (!validationResult.success) {
        logger.debug({ issues: validationResult.error.issues }, "Slonik validation error");
        throw new SchemaValidationError(actualQuery, row, validationResult.error.issues);
      }

      return validationResult.data as QueryResultRow;
    },
  };
};
