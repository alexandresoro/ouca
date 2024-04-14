import { useApiMe } from "@services/api/me/api-me-queries";
import { useApiMutation } from "@services/api/useApiMutation";
import type { SWRMutationConfiguration } from "swr/dist/mutation";

export const useApiCreateAccount = (swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  const { mutate: mutateUser } = useApiMe();

  const { onSuccess } = swrOptions ?? {};

  return useApiMutation(
    "/user/create",
    {
      method: "POST",
    },
    {
      ...swrOptions,
      onSuccess: (data, key, config) => {
        void mutateUser();
        onSuccess?.(data, key, config);
      },
    },
  );
};
