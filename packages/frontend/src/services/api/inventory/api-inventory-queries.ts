import { getInventoryResponse, upsertInventoryResponse } from "@ou-ca/common/api/inventory";
import { useApiFetch } from "@services/api/useApiFetch";
import { useApiMutation } from "@services/api/useApiMutation";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
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

export const useApiInventoryCreate = () => {
  return useApiFetch({
    path: "/inventories",
    method: "POST",
    schema: upsertInventoryResponse,
  });
};

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
