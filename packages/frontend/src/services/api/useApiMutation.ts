import fetchApi from "@utils/fetch-api";
import { useAuth } from "react-oidc-context";
import useSWRMutation, { type MutationFetcher, type SWRMutationConfiguration } from "swr/mutation";
import { type z } from "zod";
import useApiUrl from "./useApiUrl";

type MutationVariables = { body?: Record<string, unknown> };

const useApiMutation = <TData, TVariables extends MutationVariables, E = unknown>(
  key: string,
  {
    method,
    schema,
  }: {
    method: string;
    schema?: z.ZodType<TData>;
  },
  swrOptions?: SWRMutationConfiguration<TData, E>
) => {
  const { user } = useAuth();
  const apiUrl = useApiUrl();

  const accessToken = user?.access_token;

  const mutationFn: MutationFetcher<TData, string, TVariables> = async (key, { arg: variables }) => {
    const { body } = variables;

    return await fetchApi<TData>({
      // TODO: allow to decouple SWR key from path
      url: `${apiUrl}${key}`,
      method,
      body,
      token: accessToken,
      schema,
    });
  };

  return useSWRMutation(key, mutationFn, swrOptions);
};

export default useApiMutation;
