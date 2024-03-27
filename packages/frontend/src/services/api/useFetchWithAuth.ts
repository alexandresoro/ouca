import fetchApi from "@utils/fetch-api";
import { toUrlSearchParams } from "@utils/url/url-search-params";
import { useCallback } from "react";
import { useAuth } from "react-oidc-context";
import type { z } from "zod";

type UseFetchWithAuthParams<T> = { path?: string; method?: string; schema?: z.ZodType<T> };

type UseFetchWithAuthCallParams = {
  path?: string;
  body?: Record<string, unknown> | FormData;
  queryParams?: Record<string, string | number | boolean | undefined>;
};

export function useFetchWithAuth<T>({
  path,
  method,
  schema,
}: { path: string; method?: string; schema?: z.ZodType<T> }): (
  options?: Omit<UseFetchWithAuthCallParams, "path">,
) => Promise<T>;
export function useFetchWithAuth<T>({ method, schema }: Omit<UseFetchWithAuthParams<T>, "path">): ({
  path,
  body,
  queryParams,
}: {
  path: string;
  body?: Record<string, unknown>;
  queryParams?: Record<string, string | number | boolean | undefined>;
}) => Promise<T>;
export function useFetchWithAuth<T>({
  path: pathFromSignature,
  method,
  schema,
}: UseFetchWithAuthParams<T>): (params?: UseFetchWithAuthCallParams) => Promise<T> {
  const { user } = useAuth();

  const accessToken = user?.access_token;

  return useCallback(
    async (params?: UseFetchWithAuthCallParams) => {
      const { path: pathFromCall, body, queryParams } = params ?? {};

      const queryString = toUrlSearchParams(queryParams).toString();

      const path = pathFromSignature ?? pathFromCall;
      if (!path) {
        throw new Error("Missing path in query");
      }

      return fetchApi({
        url: `${path}${queryString.length ? `?${queryString}` : ""}`,
        method,
        body,
        token: accessToken,
        schema,
      });
    },
    [accessToken, pathFromSignature, method, schema],
  );
}
