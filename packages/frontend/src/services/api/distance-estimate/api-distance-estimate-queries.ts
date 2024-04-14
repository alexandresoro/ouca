import {
  distanceEstimateInfoSchema,
  getDistanceEstimateResponse,
  getDistanceEstimatesResponse,
  upsertDistanceEstimateResponse,
} from "@ou-ca/common/api/distance-estimate";
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

export const useApiDistanceEstimateQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getDistanceEstimateResponse>>,
) => {
  return useApiQuery(
    id != null ? `/distance-estimates/${id}` : null,
    {
      schema: getDistanceEstimateResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiDistanceEstimateInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof distanceEstimateInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/distance-estimates/${id}/info` : null,
    {
      schema: distanceEstimateInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiDistanceEstimatesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getDistanceEstimatesResponse>>,
) => {
  return useApiQuery(
    "/distance-estimates",
    {
      queryParams,
      schema: getDistanceEstimatesResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiDistanceEstimatesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getDistanceEstimateResponse>,
) => {
  return useApiInfiniteQuery(
    "/distance-estimates",
    {
      queryParams,
      schema: getDistanceEstimatesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiDistanceEstimateCreate = () => {
  return useApiFetch({
    path: "/distance-estimates",
    method: "POST",
    schema: upsertDistanceEstimateResponse,
  });
};

export const useApiDistanceEstimateUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertDistanceEstimateResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/distance-estimates/${id}` : null,
    {
      method: "PUT",
      schema: upsertDistanceEstimateResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiDistanceEstimateDelete = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<unknown, unknown>,
) => {
  return useApiMutation(
    id ? `/distance-estimates/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
