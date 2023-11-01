import useAppContext from "@hooks/useAppContext";
import fetchApi from "@utils/fetch-api";
import { toUrlSearchParams } from "@utils/url/url-search-params";
import { useAuth } from "react-oidc-context";
import { type SWRConfiguration } from "swr";
import useSWRImmutable from "swr/immutable";
import { type z } from "zod";

type UseSWRApiQueryParams<T = unknown> = {
  queryParams?: Record<string, string | number | string[] | number[] | boolean | undefined>;
  schema?: z.ZodType<T>;
  paused?: boolean;
};

const useSWRImmutableApiQuery = <T = unknown, E = unknown>(
  path: string,
  { queryParams, paused, schema }: UseSWRApiQueryParams<T> = {},
  swrOptions?: Omit<SWRConfiguration<T, E>, "fetcher">
) => {
  const { user } = useAuth();
  const { apiUrl } = useAppContext();

  const accessToken = user?.access_token;

  const queryString = toUrlSearchParams(queryParams).toString();

  const queryUrl = `${apiUrl}/api/v1${path}${queryString.length ? `?${queryString}` : ""}`;

  return useSWRImmutable<T, E>(!paused ? { url: queryUrl, token: accessToken, schema } : null, fetchApi<T>, swrOptions);
};

export default useSWRImmutableApiQuery;
