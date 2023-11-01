import useAppContext from "@hooks/useAppContext";
import fetchApi from "@utils/fetch-api";
import { toUrlSearchParams } from "@utils/url/url-search-params";
import { useCallback } from "react";
import { useAuth } from "react-oidc-context";
import { type z } from "zod";

function useApiFetch<SType>({
  method,
  body,
  schema,
}: {
  method?: string;
  body?: Record<string, unknown>;
  schema?: z.ZodType<SType>;
}): (params: { path: string; queryParams?: Record<string, string | number | boolean | undefined> }) => Promise<SType>;
function useApiFetch<SType>({
  method,
  body,
  schema,
}: { method?: string; body?: Record<string, unknown>; schema?: z.ZodType<SType> }) {
  const { user } = useAuth();
  const { apiUrl } = useAppContext();

  const accessToken = user?.access_token;

  return useCallback(
    async ({
      path,
      queryParams,
    }: { path: string; queryParams?: Record<string, string | number | boolean | undefined> }) => {
      const queryString = toUrlSearchParams(queryParams).toString();

      return fetchApi({
        url: `${apiUrl}/api/v1${path}${queryString.length ? `?${queryString}` : ""}`,
        method,
        body,
        token: accessToken,
        schema,
      });
    },
    [apiUrl, accessToken, method, body, schema]
  );
}

export default useApiFetch;
