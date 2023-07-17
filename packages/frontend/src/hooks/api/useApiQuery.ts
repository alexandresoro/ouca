import { useQuery, type QueryFunction, type UseQueryOptions } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { type z } from "zod";
import { toUrlSearchParams } from "../../utils/url-search-params";
import useAppContext from "../useAppContext";
import { type FetchError } from "./api-types";

const useApiQuery = <
  TQueryFnData = unknown,
  TError extends FetchError = FetchError,
  TData = TQueryFnData,
  TQueryKey extends unknown[] = unknown[]
>(
  {
    path,
    queryParams,
    schema,
  }: {
    path: string;
    queryParams?: Record<string, string | number | string[] | number[] | boolean | undefined>;
    schema?: z.ZodType<TQueryFnData>;
  },
  queryOptions?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryKey" | "queryFn">
) => {
  const { user } = useAuth();
  const { apiUrl } = useAppContext();

  const accessToken = user?.access_token;

  const queryString = toUrlSearchParams(queryParams).toString();

  const queryKey = ["API", path, ...(queryParams ? [queryParams] : [])] as unknown as TQueryKey;

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
      } satisfies FetchError);
    }
    const jsonResponse = (await response.json()) as TQueryFnData;
    if (schema) {
      // If response schema is provided, use it
      return schema.parse(jsonResponse);
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
