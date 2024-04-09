import { ageInfoSchema, getAgeResponse } from "@ou-ca/common/api/age";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiAgeQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getAgeResponse>>,
) => {
  return useApiQuery(
    id != null ? `/ages/${id}` : null,
    {
      schema: getAgeResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiAgeInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof ageInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/ages/${id}/info` : null,
    {
      schema: ageInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};
