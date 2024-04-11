import { fetchApiResponse } from "@utils/fetch-api";
import { toUrlSearchParams } from "@utils/url/url-search-params";
import { useCallback } from "react";
import { useAuth } from "react-oidc-context";
import { useApiUrl } from "./useApiUrl";

type UseApiFetchResponseParams = { path: string; method?: string };

type UseApiFetchCallParams = {
  body?: Record<string, unknown> | FormData;
  queryParams?: Record<string, string | number | boolean | undefined>;
};

export function useApiFetchResponse({
  path,
  method = "GET",
}: UseApiFetchResponseParams): (params?: UseApiFetchCallParams) => Promise<Response> {
  const { user } = useAuth();
  const apiUrl = useApiUrl();

  const accessToken = user?.access_token;

  return useCallback(
    async (params?: UseApiFetchCallParams) => {
      const { body, queryParams } = params ?? {};

      const queryString = toUrlSearchParams(queryParams).toString();

      return fetchApiResponse({
        url: `${apiUrl}${path}${queryString.length ? `?${queryString}` : ""}`,
        method,
        body,
        token: accessToken,
      });
    },
    [apiUrl, accessToken, path, method],
  );
}
