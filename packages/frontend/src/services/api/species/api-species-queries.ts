import {
  getSpeciesPaginatedResponse,
  getSpeciesResponse,
  speciesInfoSchema,
  upsertSpeciesResponse,
} from "@ou-ca/common/api/species";
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

export const useApiSpeciesQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getSpeciesResponse>>,
) => {
  return useApiQuery(
    id != null ? `/species/${id}` : null,
    {
      schema: getSpeciesResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesInfoQuery = (
  id: string | null,
  queryParams?: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof speciesInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/species/${id}/info` : null,
    {
      schema: speciesInfoSchema,
      queryParams,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesQueryAll = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getSpeciesPaginatedResponse>>,
) =>
  useApiQuery(
    "/species",
    {
      queryParams,
      schema: getSpeciesPaginatedResponse,
    },
    swrOptions,
  );

export const useApiSpeciesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getSpeciesResponse>,
) => {
  return useApiInfiniteQuery(
    "/species",
    {
      queryParams,
      schema: getSpeciesPaginatedResponse,
    },
    {
      revalidateFirstPage: false,
      revalidateAll: true,
      ...swrOptions,
    },
  );
};

export const useApiSpeciesCreate = () => {
  return useApiFetch({
    path: "/species",
    method: "POST",
    schema: upsertSpeciesResponse,
  });
};

export const useApiSpeciesUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertSpeciesResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/species/${id}` : null,
    {
      method: "PUT",
      schema: upsertSpeciesResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiSpeciesDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/species/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
