import { getLocalitiesResponse, localityInfoSchema } from "@ou-ca/common/api/locality";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiLocalityInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof localityInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/localities/${id}/info` : null,
    {
      schema: localityInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiLocalitiesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getLocalitiesResponse>>,
  { paused = false } = {},
) => {
  return useApiQuery(
    "/localities",
    {
      queryParams,
      schema: getLocalitiesResponse,
      paused,
    },
    {
      ...swrOptions,
    },
  );
};
