import { getMeResponse } from "@ou-ca/common/api/me";
import { useApiMutation } from "@services/api/useApiMutation";
import { useApiQuery } from "@services/api/useApiQuery";
import type { SWRMutationConfiguration } from "swr/dist/mutation";
import type { z } from "zod";

export const useApiMe = () => {
  const { data } = useApiQuery(
    "/me",
    {
      schema: getMeResponse,
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  );

  return data;
};

export const useApiSettingsUpdate = (swrOptions?: SWRMutationConfiguration<z.infer<typeof getMeResponse>, unknown>) => {
  return useApiMutation(
    "/me",
    {
      method: "PUT",
      schema: getMeResponse,
    },
    {
      ...swrOptions,
    },
  );
};
