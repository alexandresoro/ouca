import {
  environmentInfoSchema,
  getEnvironmentResponse,
  getEnvironmentsResponse,
  upsertEnvironmentResponse,
} from "@ou-ca/common/api/environment";
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

export const useApiEnvironmentQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getEnvironmentResponse>>,
) => {
  return useApiQuery(
    id != null ? `/environments/${id}` : null,
    {
      schema: getEnvironmentResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof environmentInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/environments/${id}/info` : null,
    {
      schema: environmentInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentsQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getEnvironmentsResponse>>,
) => {
  return useApiQuery(
    "/environments",
    {
      queryParams,
      schema: getEnvironmentsResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentsInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getEnvironmentResponse>,
) => {
  return useApiInfiniteQuery(
    "/environments",
    {
      queryParams,
      schema: getEnvironmentsResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentCreate = () => {
  return useApiFetch({
    path: "/environments",
    method: "POST",
    schema: upsertEnvironmentResponse,
  });
};

export const useApiEnvironmentUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertEnvironmentResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/environments/${id}` : null,
    {
      method: "PUT",
      schema: upsertEnvironmentResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/environments/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
