import { environmentInfoSchema, getEnvironmentsResponse } from "@ou-ca/common/api/environment";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiEnvironmentInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof environmentInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/environments/${id}/info` : null,
    {
      schema: environmentInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentsQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getEnvironmentsResponse>>,
) => {
  return useApiQuery(
    "/environments",
    {
      queryParams,
      schema: getEnvironmentsResponse,
    },
    {
      ...swrOptions,
    },
  );
};
