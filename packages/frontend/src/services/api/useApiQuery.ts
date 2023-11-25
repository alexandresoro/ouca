import fetchApi from "@utils/fetch-api";
import { toUrlSearchParams } from "@utils/url/url-search-params";
import { useAuth } from "react-oidc-context";
import useSWR, { type SWRConfiguration } from "swr";
import { type z } from "zod";
import useApiUrl from "./useApiUrl";

type UseApiQueryParams<T = unknown> = {
  queryParams?: Record<string, string | number | string[] | number[] | boolean | undefined>;
  schema?: z.ZodType<T>;
  paused?: boolean;
};

const useApiQuery = <T = unknown, E = unknown>(
  path: string,
  { queryParams, paused, schema }: UseApiQueryParams<T> = {},
  swrOptions?: Omit<SWRConfiguration<T, E>, "fetcher">
) => {
  const { user } = useAuth();
  const apiUrl = useApiUrl();

  const accessToken = user?.access_token;

  const queryString = toUrlSearchParams(queryParams).toString();

  const queryUrl = `${apiUrl}${path}${queryString.length ? `?${queryString}` : ""}`;

  return useSWR(
    !paused ? { url: queryUrl, token: accessToken } : null,
    ({ url, token }) => fetchApi({ url, token, schema }),
    swrOptions
  );
};

export default useApiQuery;
