import { ageInfoSchema, getAgeResponse, getAgesResponse } from "@ou-ca/common/api/age";
import {
  type UseApiInfiniteQueryCommonParams,
  type UseApiQuerySWRInfiniteOptions,
  useApiInfiniteQuery,
} from "@services/api/useApiInfiniteQuery";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
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

export const useApiAgesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getAgesResponse>>,
) => {
  return useApiQuery(
    "/ages",
    {
      queryParams,
      schema: getAgesResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiAgesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getAgeResponse>,
) => {
  return useApiInfiniteQuery(
    "/ages",
    {
      queryParams,
      schema: getAgesResponse,
    },
    {
      ...swrOptions,
    },
  );
};
