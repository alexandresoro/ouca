import { type PaginatedResponseSchemaType } from "@ou-ca/common/api/common/pagination";
import { useInfiniteQuery, type QueryFunction, type UseInfiniteQueryOptions } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { type z } from "zod";
import { toUrlSearchParams } from "../../utils/url-search-params";
import useAppContext from "../useAppContext";
import { type FetchError } from "./api-types";

const getNextPage = (page: z.infer<PaginatedResponseSchemaType<z.ZodAny>>): number | undefined => {
  if (page.meta.pageNumber === undefined || page.meta.pageSize === undefined) {
    return undefined;
  }

  if (page.meta.pageNumber * page.meta.pageSize >= page.meta.count) {
    return undefined;
  }

  return page.meta.pageNumber + 1;
};

const useApiInfiniteQuery = <
  S extends z.ZodAny,
  TQueryFnData extends z.infer<PaginatedResponseSchemaType<S>>,
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
    schema: z.ZodType<TQueryFnData>;
  },
  queryOptions?: Omit<
    UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>,
    "queryKey" | "queryFn"
  >
) => {
  const { user } = useAuth();
  const { apiUrl } = useAppContext();

  const accessToken = user?.access_token;

  const queryKey = ["API", path, ...(queryParams ? [queryParams] : []), "infinite"] as unknown as TQueryKey;

  const queryFn: QueryFunction<TQueryFnData, TQueryKey, number> = async ({ pageParam = 1 }) => {
    const queryString = toUrlSearchParams({ ...queryParams, pageNumber: pageParam }).toString();
    const response = await fetch(`${apiUrl}/api/v1${path}?${queryString}`, {
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
    const jsonResponse = (await response.json()) as unknown;
    return schema.parse(jsonResponse);
  };

  return useInfiniteQuery({
    ...queryOptions,
    queryKey,
    queryFn,
    getNextPageParam: (lastPage) => getNextPage(lastPage),
  });
};

export default useApiInfiniteQuery;
