import fetchApi from "@utils/fetch-api";
import { toUrlSearchParams } from "@utils/url/url-search-params";
import { useAuth } from "react-oidc-context";
import useSWR, { type SWRConfiguration } from "swr";
import type { z } from "zod";

export type ApiQueryKey = {
  url: string;
  token: string | undefined;
} | null;

export type UseQueryWithAuthCommonParams = {
  queryParams?: Record<string, string | number | string[] | number[] | boolean | undefined>;
  paused?: boolean;
};

type UseQueryWithAuthParams<T = unknown> = UseQueryWithAuthCommonParams & {
  schema?: z.ZodType<T>;
};

export type UseQueryWithAuthSWROptions<T = unknown, E = unknown> = Omit<SWRConfiguration<T, E>, "fetcher">;

export const useQueryWithAuth = <T = unknown, E = unknown>(
  path: string,
  { queryParams, paused, schema }: UseQueryWithAuthParams<T> = {},
  swrOptions?: UseQueryWithAuthSWROptions<T, E>,
) => {
  const { user } = useAuth();

  const accessToken = user?.access_token;

  const queryString = toUrlSearchParams(queryParams).toString();

  const queryUrl = `${path}${queryString.length ? `?${queryString}` : ""}`;

  return useSWR<T, E, ApiQueryKey>(
    !paused ? { url: queryUrl, token: accessToken } : null,
    ({ url, token }) => fetchApi({ url, token, schema }),
    swrOptions,
  );
};
