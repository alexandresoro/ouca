import useApiMutationTQ from "@hooks/api/useApiMutation";
import {
  type UpsertInventoryInput,
  type UpsertInventoryResponse,
  getInventoryResponse,
  upsertInventoryResponse,
} from "@ou-ca/common/api/inventory";
import { useApiMutation } from "@services/api/useApiMutation";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { FetchErrorType } from "@utils/fetch-api";
import type { SWRMutationConfiguration } from "swr/dist/mutation";
import type { z } from "zod";

export const useApiInventoryQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getInventoryResponse>>,
) => {
  return useApiQuery(
    id != null ? `/inventories/${id}` : null,
    {
      schema: getInventoryResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiInventoryCreate = (
  mutationOptions?: Omit<
    UseMutationOptions<UpsertInventoryResponse, FetchErrorType, { body: UpsertInventoryInput }>,
    "mutationFn"
  >,
) =>
  useApiMutationTQ(
    {
      path: "/inventories",
      method: "POST",
      schema: upsertInventoryResponse,
    },
    mutationOptions,
  );

export const useApiInventoryUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof upsertInventoryResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/inventories/${id}` : null,
    {
      method: "PUT",
      schema: upsertInventoryResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiInventoryDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/inventories/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
