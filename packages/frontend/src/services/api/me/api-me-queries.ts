import { getMeResponse } from "@ou-ca/common/api/me";
import { useApiMutation } from "@services/api/useApiMutation";
import { useApiQuery } from "@services/api/useApiQuery";
import { useSetAtom } from "jotai";
import type { SWRMutationConfiguration } from "swr/dist/mutation";
import type { z } from "zod";
import { settingsAtom } from "./settingsAtom";

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
  const { onSuccess: customOnSuccess, ...restSwrOptions } = swrOptions ?? {};

  const setUserSettings = useSetAtom(settingsAtom);

  return useApiMutation(
    "/me",
    {
      method: "PUT",
      schema: getMeResponse,
    },
    {
      onSuccess: (updatedSettings, key, config) => {
        setUserSettings(updatedSettings.settings);
        customOnSuccess?.(updatedSettings, key, config);
      },
      ...restSwrOptions,
    },
  );
};
