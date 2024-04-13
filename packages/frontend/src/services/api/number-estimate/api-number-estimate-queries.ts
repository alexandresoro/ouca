import {
  getNumberEstimateResponse,
  getNumberEstimatesResponse,
  numberEstimateInfoSchema,
} from "@ou-ca/common/api/number-estimate";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiNumberEstimateQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getNumberEstimateResponse>>,
) => {
  return useApiQuery(
    id != null ? `/number-estimates/${id}` : null,
    {
      schema: getNumberEstimateResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiNumberEstimateInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof numberEstimateInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/number-estimates/${id}/info` : null,
    {
      schema: numberEstimateInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiNumberEstimatesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getNumberEstimatesResponse>>,
) => {
  return useApiQuery(
    "/number-estimates",
    {
      queryParams,
      schema: getNumberEstimatesResponse,
    },
    {
      ...swrOptions,
    },
  );
};
