import { getSexResponse, getSexesResponse, sexInfoSchema, upsertSexResponse } from "@ou-ca/common/api/sex";
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

export const useApiSexQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getSexResponse>>,
) => {
  return useApiQuery(
    id != null ? `/sexes/${id}` : null,
    {
      schema: getSexResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSexInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof sexInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/sexes/${id}/info` : null,
    {
      schema: sexInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSexesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getSexesResponse>>,
) => {
  return useApiQuery(
    "/sexes",
    {
      queryParams,
      schema: getSexesResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSexesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getSexResponse>,
) => {
  return useApiInfiniteQuery(
    "/sexes",
    {
      queryParams,
      schema: getSexesResponse,
    },
    {
      revalidateFirstPage: false,
      revalidateAll: true,
      ...swrOptions,
    },
  );
};

export const useApiSexCreate = () => {
  return useApiFetch({
    path: "/sexes",
    method: "POST",
    schema: upsertSexResponse,
  });
};

export const useApiSexUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertSexResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/sexes/${id}` : null,
    {
      method: "PUT",
      schema: upsertSexResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiSexDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/sexes/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
