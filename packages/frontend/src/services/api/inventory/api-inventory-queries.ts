import useApiMutation from "@hooks/api/useApiMutation";
import {
  upsertInventoryResponse,
  type UpsertInventoryInput,
  type UpsertInventoryResponse,
} from "@ou-ca/common/api/inventory";
import { type UseMutationOptions } from "@tanstack/react-query";
import { type FetchErrorType } from "@utils/fetch-api";
import { z } from "zod";

export const useApiInventoryCreate = (
  mutationOptions?: Omit<
    UseMutationOptions<UpsertInventoryResponse, FetchErrorType, { body: UpsertInventoryInput }>,
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
    UseMutationOptions<UpsertInventoryResponse, FetchErrorType, { path?: string; body: UpsertInventoryInput }>,
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

export const useApiInventoryDelete = (
  mutationOptions?: Omit<UseMutationOptions<{ id: string }, FetchErrorType, { path?: string }>, "mutationFn">
) => {
  const { mutate, ...restUseMutation } = useApiMutation(
    {
      method: "DELETE",
      schema: z.object({ id: z.string() }),
    },
    { ...mutationOptions }
  );

  const mutateApi = ({ inventoryId }: { inventoryId: string }) =>
    mutate({
      path: `/inventories/${inventoryId}`,
    });

  return { ...restUseMutation, mutate: mutateApi };
};
