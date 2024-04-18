import useApiMutationTQ from "@hooks/api/useApiMutation";
import {
  type UpsertEntryInput,
  type UpsertEntryResponse,
  getEntriesResponse,
  type getEntryResponse,
  upsertEntryResponse,
} from "@ou-ca/common/api/entry";
import {
  type UseApiInfiniteQueryCommonParams,
  type UseApiQuerySWRInfiniteOptions,
  useApiInfiniteQuery,
} from "@services/api/useApiInfiniteQuery";
import { useApiMutation } from "@services/api/useApiMutation";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { FetchErrorType } from "@utils/fetch-api";
import type { SWRMutationConfiguration } from "swr/dist/mutation";
import type { z } from "zod";

export const useApiEntriesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getEntriesResponse>>,
  { paused = false } = {},
) =>
  useApiQuery(
    "/entries",
    {
      queryParams,
      schema: getEntriesResponse,
      paused,
    },
    swrOptions,
  );

export const useApiEntriesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getEntryResponse>,
  { paused = false } = {},
) => {
  return useApiInfiniteQuery(
    paused ? null : "/entries",
    {
      queryParams,
      schema: getEntriesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiEntryCreate = (
  mutationOptions?: Omit<
    UseMutationOptions<UpsertEntryResponse, FetchErrorType, { body: UpsertEntryInput }>,
    "mutationFn"
  >,
) =>
  useApiMutationTQ(
    {
      path: "/entries",
      method: "POST",
      schema: upsertEntryResponse,
    },
    mutationOptions,
  );

export const useApiEntryUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertEntryResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/entries/${id}` : null,
    {
      method: "PUT",
      schema: upsertEntryResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiEntryDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/entries/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
