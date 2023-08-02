import { upsertEntryResponse, type UpsertEntryInput, type UpsertEntryResponse } from "@ou-ca/common/api/entry";
import { type UseMutationOptions } from "@tanstack/react-query";
import { type FetchError } from "../api-types";
import useApiMutation from "../useApiMutation";

export const useApiEntryCreate = (
  mutationOptions?: Omit<UseMutationOptions<UpsertEntryResponse, FetchError, { body: UpsertEntryInput }>, "mutationFn">
) =>
  useApiMutation(
    {
      path: "/entries",
      method: "POST",
      schema: upsertEntryResponse,
    },
    mutationOptions
  );

export const useApiEntryUpdate = (
  mutationOptions?: Omit<
    UseMutationOptions<UpsertEntryResponse, FetchError, { path?: string; body: UpsertEntryInput }>,
    "mutationFn"
  >
) => {
  const { mutate, ...restUseMutation } = useApiMutation(
    {
      method: "PUT",
      schema: upsertEntryResponse,
    },
    { ...mutationOptions }
  );

  const mutateApi = ({ entryId, body }: { entryId: string; body: UpsertEntryInput }) =>
    mutate({
      path: `/entries/${entryId}`,
      body,
    });

  return { ...restUseMutation, mutate: mutateApi };
};

export const useApiEntryDelete = (
  mutationOptions?: Omit<UseMutationOptions<unknown, FetchError, { path?: string }>, "mutationFn">
) => {
  const { mutate, ...restUseMutation } = useApiMutation(
    {
      method: "DELETE",
    },
    { ...mutationOptions }
  );

  const mutateApi = ({ entryId }: { entryId: string }) =>
    mutate({
      path: `/entries/${entryId}`,
    });

  return { ...restUseMutation, mutate: mutateApi };
};
