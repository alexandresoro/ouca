import { behaviorInfoSchema, getBehaviorsResponse } from "@ou-ca/common/api/behavior";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiBehaviorInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof behaviorInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/behaviors/${id}/info` : null,
    {
      schema: behaviorInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiBehaviorsQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getBehaviorsResponse>>,
) => {
  return useApiQuery(
    "/behaviors",
    {
      queryParams,
      schema: getBehaviorsResponse,
    },
    {
      ...swrOptions,
    },
  );
};
