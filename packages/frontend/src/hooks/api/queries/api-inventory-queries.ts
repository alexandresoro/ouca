import {
  upsertInventoryResponse,
  type UpsertInventoryInput,
  type UpsertInventoryResponse,
} from "@ou-ca/common/api/inventory";
import { type UseMutationOptions } from "@tanstack/react-query";
import { type FetchError } from "../api-types";
import useApiMutation from "../useApiMutation";

export const useApiInventoryCreate = (
  mutationOptions?: Omit<
    UseMutationOptions<UpsertInventoryResponse, FetchError, { body: UpsertInventoryInput }>,
    "mutationFn"
  >
) =>
  useApiMutation(
    {
      path: "/inventories",
      method: "POST",
      schema: upsertInventoryResponse,
    },
    mutationOptions
  );

export const useApiInventoryUpdate = (
  mutationOptions?: Omit<
    UseMutationOptions<UpsertInventoryResponse, FetchError, { path?: string; body: UpsertInventoryInput }>,
    "mutationFn"
  >
) => {
  const { mutate, ...restUseMutation } = useApiMutation(
    {
      method: "PUT",
      schema: upsertInventoryResponse,
    },
    { ...mutationOptions }
  );

  const mutateApi = ({ inventoryId, body }: { inventoryId: string; body: UpsertInventoryInput }) =>
    mutate({
      path: `/inventories/${inventoryId}`,
      body,
    });

  return { ...restUseMutation, mutate: mutateApi };
};
