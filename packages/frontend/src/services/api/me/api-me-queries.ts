import { getMeResponse } from "@ou-ca/common/api/me";
import { useApiMutation } from "@services/api/useApiMutation";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import { FetchError } from "@utils/fetch-api";
import { useNavigate } from "react-router-dom";
import type { SWRMutationConfiguration } from "swr/dist/mutation";
import type { z } from "zod";

export const useApiMe = (swrOptions?: UseApiQuerySWROptions<z.infer<typeof getMeResponse>>) => {
  const { onError, ...restSwrOptions } = swrOptions ?? {};

  const navigate = useNavigate();

  return useApiQuery(
    "/me",
    {
      schema: getMeResponse,
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      onError: (err, key, config) => {
        // In case the user is valid but doesn't have an account, redirect to the new account page
        if (err instanceof FetchError && err.status === 404) {
          navigate("/new-account", { replace: true });
        }
        onError?.(err, key, config);
      },
      shouldRetryOnError: (err) => {
        // If we receive a 404, we don't want to retry as we assume the user doesn't exist
        return !(err instanceof FetchError && err.status === 404);
      },
      ...restSwrOptions,
    },
  );
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
