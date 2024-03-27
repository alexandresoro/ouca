import useApiMutation from "@hooks/api/useApiMutation";
import {
  type UpsertEntryInput,
  type UpsertEntryResponse,
  getEntriesResponse,
  upsertEntryResponse,
} from "@ou-ca/common/api/entry";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { FetchErrorType } from "@utils/fetch-api";
import type { z } from "zod";

export const useApiEntryQueryAll = (
  params: UseApiQueryCommonParams,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getEntriesResponse>>,
) =>
  useApiQuery(
    "/entries",
    {
      schema: getEntriesResponse,
      ...params,
    },
    swrOptions,
  );

export const useApiEntryCreate = (
  mutationOptions?: Omit<
    UseMutationOptions<UpsertEntryResponse, FetchErrorType, { body: UpsertEntryInput }>,
    "mutationFn"
  >,
) =>
  useApiMutation(
    {
      path: "/entries",
      method: "POST",
      schema: upsertEntryResponse,
    },
    mutationOptions,
  );

export const useApiEntryUpdate = (
  mutationOptions?: Omit<
    UseMutationOptions<UpsertEntryResponse, FetchErrorType, { path?: string; body: UpsertEntryInput }>,
    "mutationFn"
  >,
) => {
  const { mutate, ...restUseMutation } = useApiMutation(
    {
      method: "PUT",
      schema: upsertEntryResponse,
    },
    { ...mutationOptions },
  );

  const mutateApi = ({ entryId, body }: { entryId: string; body: UpsertEntryInput }) =>
    mutate({
      path: `/entries/${entryId}`,
      body,
    });

  return { ...restUseMutation, mutate: mutateApi };
};

export const useApiEntryDelete = (
  mutationOptions?: Omit<UseMutationOptions<unknown, FetchErrorType, { path?: string }>, "mutationFn">,
) => {
  const { mutate, ...restUseMutation } = useApiMutation(
    {
      method: "DELETE",
    },
    { ...mutationOptions },
  );

  const mutateApi = ({ entryId }: { entryId: string }) =>
    mutate({
      path: `/entries/${entryId}`,
    });

  return { ...restUseMutation, mutate: mutateApi };
};
