import {
  getClassResponse,
  getClassesResponse,
  speciesClassInfoSchema,
  upsertClassResponse,
} from "@ou-ca/common/api/species-class";
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

export const useApiSpeciesClassQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getClassResponse>>,
) => {
  return useApiQuery(
    id != null ? `/classes/${id}` : null,
    {
      schema: getClassResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof speciesClassInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/classes/${id}/info` : null,
    {
      schema: speciesClassInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getClassesResponse>>,
) => {
  return useApiQuery(
    "/classes",
    {
      queryParams,
      schema: getClassesResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getClassResponse>,
) => {
  return useApiInfiniteQuery(
    "/classes",
    {
      queryParams,
      schema: getClassesResponse,
    },
    {
      revalidateFirstPage: false,
      revalidateAll: true,
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassCreate = () => {
  return useApiFetch({
    path: "/classes",
    method: "POST",
    schema: upsertClassResponse,
  });
};

export const useApiSpeciesClassUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertClassResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/classes/${id}` : null,
    {
      method: "PUT",
      schema: upsertClassResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassDelete = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<unknown, unknown>,
) => {
  return useApiMutation(
    id ? `/classes/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
