import type { Logger } from "pino";
import { serializeError } from "serialize-error";
import type { Interceptor } from "slonik";

export const createQueryLoggingInterceptor = (pinoLogger: Logger): Interceptor => {
  return {
    afterQueryExecution: (context, query, result) => {
      pinoLogger.trace(
        {
          executionTime: Number(process.hrtime.bigint() - BigInt(context.queryInputTime)) / 1_000_000,
          rowCount: result?.rowCount ?? null,
          queryId: context.queryId,
        },
        "query execution result"
      );

      return null;
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    beforeQueryExecution: async (context, query) => {
      pinoLogger.trace(
        {
          sql: query.sql,
          queryId: context.queryId,
        },
        "executing query"
      );

      return null;
    },
    queryExecutionError: (context, query, error) => {
      pinoLogger.warn(
        {
          error: serializeError(error),
        },
        "query execution produced an error"
      );

      return null;
    },
  };
};
