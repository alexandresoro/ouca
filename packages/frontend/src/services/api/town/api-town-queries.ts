import { getTownResponse, getTownsResponse, townInfoSchema, upsertTownResponse } from "@ou-ca/common/api/town";
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

export const useApiTownQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getTownResponse>>,
) => {
  return useApiQuery(
    id != null ? `/towns/${id}` : null,
    {
      schema: getTownResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiTownInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof townInfoSchema>>,
) => {
  return useApiQuery(
    id != null ? `/towns/${id}/info` : null,
    {
      schema: townInfoSchema,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiTownsQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getTownsResponse>>,
  { paused = false } = {},
) => {
  return useApiQuery(
    "/towns",
    {
      queryParams,
      schema: getTownsResponse,
      paused,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiTownsInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getTownResponse>,
) => {
  return useApiInfiniteQuery(
    "/towns",
    {
      queryParams,
      schema: getTownsResponse,
    },
    {
      revalidateFirstPage: false,
      revalidateAll: true,
      ...swrOptions,
    },
  );
};

export const useApiTownCreate = () => {
  return useApiFetch({
    path: "/towns",
    method: "POST",
    schema: upsertTownResponse,
  });
};

export const useApiTownUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertTownResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/towns/${id}` : null,
    {
      method: "PUT",
      schema: upsertTownResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiTownDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/towns/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
