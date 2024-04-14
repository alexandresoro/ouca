import { ageInfoSchema, getAgeResponse, getAgesResponse, upsertAgeResponse } from "@ou-ca/common/api/age";
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
      revalidateFirstPage: false,
      revalidateAll: true,
      ...swrOptions,
    },
  );
};

export const useApiAgeCreate = () => {
  return useApiFetch({
    path: "/ages",
    method: "POST",
    schema: upsertAgeResponse,
  });
};

export const useApiAgeUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertAgeResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/ages/${id}` : null,
    {
      method: "PUT",
      schema: upsertAgeResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiAgeDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/ages/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
