import { deleteObserverResponse, getObserverResponse, upsertObserverResponse } from "@ou-ca/common/api/observer";
import useApiFetch from "@services/api/useApiFetch";
import useApiMutation from "@services/api/useApiMutation";
import useApiQuery from "@services/api/useApiQuery";
import { type SWRMutationConfiguration } from "swr/mutation";
import { type z } from "zod";

export const useApiObserverQuery = (id: string) => {
  return useApiQuery(`/observers/${id}`, {
    schema: getObserverResponse,
  });
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
