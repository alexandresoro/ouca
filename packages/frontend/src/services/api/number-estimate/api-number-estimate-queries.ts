import {
  getNumberEstimateResponse,
  getNumberEstimatesResponse,
  numberEstimateInfoSchema,
  upsertNumberEstimateResponse,
} from "@ou-ca/common/api/number-estimate";
import { useApiFetch } from "@services/api/useApiFetch";
import {
  type UseApiInfiniteQueryCommonParams,
  type UseApiQuerySWRInfiniteOptions,
  useApiInfiniteQuery,
} from "@services/api/useApiInfiniteQuery";
import { useApiMutation } from "@services/api/useApiMutation";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { SWRMutationConfiguration } from "swr/dist/mutation";
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

export const useApiNumberEstimatesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getNumberEstimateResponse>,
) => {
  return useApiInfiniteQuery(
    "/number-estimates",
    {
      queryParams,
      schema: getNumberEstimatesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiNumberEstimateCreate = () => {
  return useApiFetch({
    path: "/number-estimates",
    method: "POST",
    schema: upsertNumberEstimateResponse,
  });
};

export const useApiNumberEstimateUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertNumberEstimateResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/number-estimates/${id}` : null,
    {
      method: "PUT",
      schema: upsertNumberEstimateResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiNumberEstimateDelete = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<unknown, unknown>,
) => {
  return useApiMutation(
    id ? `/number-estimates/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
