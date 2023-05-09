import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { type z } from "zod";
import useAppContext from "../useAppContext";

function useApiQuery(
  { path, queryParams }: { path: string; queryParams?: Record<string, string>; schema?: never },
  queryOptions?: Omit<UseQueryOptions, "queryKey" | "queryFn">
): UseQueryResult<unknown>;
function useApiQuery<SType>(
  { path, queryParams, schema }: { path: string; queryParams?: Record<string, string>; schema?: z.ZodType<SType> },
  queryOptions?: Omit<UseQueryOptions<SType>, "queryKey" | "queryFn">
): UseQueryResult<SType>;
function useApiQuery<SType>(
  { path, queryParams, schema }: { path: string; queryParams?: Record<string, string>; schema?: z.ZodType<SType> },
  queryOptions?: Omit<UseQueryOptions, "queryKey" | "queryFn">
) {
  const { user } = useAuth();
  const { apiUrl } = useAppContext();

  const accessToken = user?.access_token;

  const queryString = new URLSearchParams(queryParams).toString();

  const queryKey = ["API", path, ...(queryParams ? [queryParams] : [])];

  return useQuery<unknown>({
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
        throw new Error("API call error");
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
