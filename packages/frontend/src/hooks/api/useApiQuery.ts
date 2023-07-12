import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { type z } from "zod";
import { toUrlSearchParams } from "../../utils/url-search-params";
import useAppContext from "../useAppContext";
import { type FetchError } from "./api-types";

function useApiQuery<SType>(
  {
    path,
    queryParams,
    schema,
  }: {
    path: string;
    queryParams?: Record<string, string | number | string[] | number[] | boolean | undefined>;
    schema?: z.ZodType<SType>;
  },
  queryOptions?: Omit<UseQueryOptions<SType, FetchError>, "queryKey" | "queryFn">
): UseQueryResult<SType, FetchError>;
function useApiQuery<SType>(
  {
    path,
    queryParams,
    schema,
  }: {
    path: string;
    queryParams?: Record<string, string | number | string[] | number[] | boolean | undefined>;
    schema?: z.ZodType<SType>;
  },
  queryOptions?: Omit<UseQueryOptions<unknown, FetchError>, "queryKey" | "queryFn">
) {
  const { user } = useAuth();
  const { apiUrl } = useAppContext();

  const accessToken = user?.access_token;

  const queryString = toUrlSearchParams(queryParams).toString();

  const queryKey = ["API", path, ...(queryParams ? [queryParams] : [])];

  return useQuery<unknown, FetchError>({
    ...queryOptions,
    queryKey: queryKey,
    queryFn: async () => {
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
      const jsonResponse = (await response.json()) as unknown;
      if (schema) {
        // If response schema is provided, use it
        return schema.parse(jsonResponse);
      } else {
        return jsonResponse;
      }
    },
  });
}

export default useApiQuery;
