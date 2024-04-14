import {
  deleteObserverResponse,
  getObserverResponse,
  getObserversResponse,
  observerInfoSchema,
  upsertObserverResponse,
} from "@ou-ca/common/api/observer";
import { useApiFetch } from "@services/api/useApiFetch";
import {
  type UseApiInfiniteQueryCommonParams,
  type UseApiQuerySWRInfiniteOptions,
  useApiInfiniteQuery,
} from "@services/api/useApiInfiniteQuery";
import { useApiMutation } from "@services/api/useApiMutation";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { SWRMutationConfiguration } from "swr/mutation";
import type { z } from "zod";

export const useApiObserverQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getObserverResponse>>,
) => {
  return useApiQuery(
    id != null ? `/observers/${id}` : null,
    {
      schema: getObserverResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiObserverInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof observerInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/observers/${id}/info` : null,
    {
      schema: observerInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiObserversQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getObserversResponse>>,
) => {
  return useApiQuery(
    "/observers",
    {
      queryParams,
      schema: getObserversResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiObserversInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getObserverResponse>,
) => {
  return useApiInfiniteQuery(
    "/observers",
    {
      queryParams,
      schema: getObserversResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiObserverCreate = () => {
  return useApiFetch({
    path: "/observers",
    method: "POST",
    schema: upsertObserverResponse,
  });
};

export const useApiObserverUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertObserverResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/observers/${id}` : null,
    {
      method: "PUT",
      schema: upsertObserverResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiObserverDelete = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof deleteObserverResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/observers/${id}` : null,
    {
      method: "DELETE",
      schema: deleteObserverResponse,
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
