import {
  getLocalitiesResponse,
  getLocalityResponse,
  localityInfoSchema,
  upsertLocalityResponse,
} from "@ou-ca/common/api/locality";
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

export const useApiLocalityQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getLocalityResponse>>,
) => {
  return useApiQuery(
    id != null ? `/localitys/${id}` : null,
    {
      schema: getLocalityResponse,
    },
    {
      ...swrOptions,
    },
  );
};

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

export const useApiLocalitiesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getLocalityResponse>,
) => {
  return useApiInfiniteQuery(
    "/localities",
    {
      queryParams,
      schema: getLocalitiesResponse,
    },
    {
      revalidateFirstPage: false,
      revalidateAll: true,
      ...swrOptions,
    },
  );
};

export const useApiLocalityCreate = () => {
  return useApiFetch({
    path: "/localities",
    method: "POST",
    schema: upsertLocalityResponse,
  });
};

export const useApiLocalityUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertLocalityResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/localities/${id}` : null,
    {
      method: "PUT",
      schema: upsertLocalityResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiLocalityDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/localities/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
