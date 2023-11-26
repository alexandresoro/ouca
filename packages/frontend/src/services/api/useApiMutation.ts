import fetchApi from "@utils/fetch-api";
import { useAuth } from "react-oidc-context";
import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";
import { type z } from "zod";
import { type ApiQueryKey } from "./useApiQuery";
import useApiUrl from "./useApiUrl";

type MutationVariables = { body?: Record<string, unknown> };

const useApiMutation = <T, TVariables extends MutationVariables, E = unknown>(
  path: string | null,
  {
    method,
    schema,
  }: {
    method: string;
    schema?: z.ZodType<T>;
  },
  swrOptions?: Omit<SWRMutationConfiguration<T, E, ApiQueryKey>, "fetcher">
) => {
  const { user } = useAuth();
  const apiUrl = useApiUrl();

  const accessToken = user?.access_token;

  const queryUrl = path ? `${apiUrl}${path}` : null;

  return useSWRMutation<T, E, ApiQueryKey, TVariables>(
    queryUrl ? { url: queryUrl, token: accessToken } : null,
    async ({ token, url }, { arg: variables }) => {
      const { body } = variables;

      return await fetchApi({
        url,
        method,
        body,
        token,
        schema,
      });
    },
    {
      throwOnError: false, // Don't throw errors, let them be handled by the onError callback
      ...swrOptions,
    }
  );
};

export default useApiMutation;
