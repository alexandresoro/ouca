import { apiUrlAtom } from "@services/api/useApiUrl";
import { type QueryFunction, type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { FetchErrorType } from "@utils/fetch-api";
import { toUrlSearchParams } from "@utils/url/url-search-params";
import { useAtomValue } from "jotai";
import { useAuth } from "react-oidc-context";
import type { z } from "zod";

const useApiQuery = <
  TQueryFnData = unknown,
  TError extends FetchErrorType = FetchErrorType,
  TData = TQueryFnData,
  TQueryKey extends unknown[] = unknown[],
>(
  {
    queryKeyPrefix,
    path,
    queryParams,
    schema,
  }: {
    queryKeyPrefix?: string;
    path: string;
    queryParams?: Record<string, string | number | string[] | number[] | boolean | undefined>;
    schema?: z.ZodType<TQueryFnData>;
  },
  queryOptions?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryKey" | "queryFn">,
) => {
  const { user } = useAuth();
  const apiUrl = useAtomValue(apiUrlAtom);

  const accessToken = user?.access_token;

  const queryString = toUrlSearchParams(queryParams).toString();

  const queryKey = [
    "API",
    ...(queryKeyPrefix ? [queryKeyPrefix] : []),
    path,
    ...(queryParams ? [queryParams] : []),
  ] as unknown as TQueryKey;

  const queryFn: QueryFunction<TQueryFnData, TQueryKey> = async () => {
    const response = await fetch(`${apiUrl}/api/v1${path}${queryString.length ? `?${queryString}` : ""}`, {
      headers: {
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
      },
    });
    if (!response.ok) {
      return Promise.reject({
        status: response.status,
        statusText: response.statusText,
      } satisfies FetchErrorType);
    }
    const jsonResponse = (await response.json()) as TQueryFnData;
    if (schema) {
      // If response schema is provided, use it
      return schema.parse(jsonResponse);
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      return jsonResponse;
    }
  };

  return useQuery({
    ...queryOptions,
    queryKey,
    queryFn,
  });
};

export default useApiQuery;
