import {
  behaviorInfoSchema,
  getBehaviorResponse,
  getBehaviorsResponse,
  upsertBehaviorResponse,
} from "@ou-ca/common/api/behavior";
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

export const useApiBehaviorQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getBehaviorResponse>>,
) => {
  return useApiQuery(
    id != null ? `/behaviors/${id}` : null,
    {
      schema: getBehaviorResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiBehaviorInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof behaviorInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/behaviors/${id}/info` : null,
    {
      schema: behaviorInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiBehaviorsQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getBehaviorsResponse>>,
) => {
  return useApiQuery(
    "/behaviors",
    {
      queryParams,
      schema: getBehaviorsResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiBehaviorsInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getBehaviorResponse>,
) => {
  return useApiInfiniteQuery(
    "/behaviors",
    {
      queryParams,
      schema: getBehaviorsResponse,
    },
    {
      revalidateFirstPage: false,
      revalidateAll: true,
      ...swrOptions,
    },
  );
};

export const useApiBehaviorCreate = () => {
  return useApiFetch({
    path: "/behaviors",
    method: "POST",
    schema: upsertBehaviorResponse,
  });
};

export const useApiBehaviorUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertBehaviorResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/behaviors/${id}` : null,
    {
      method: "PUT",
      schema: upsertBehaviorResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiBehaviorDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/behaviors/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
