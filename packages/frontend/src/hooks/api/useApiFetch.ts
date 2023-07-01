import { useAuth } from "react-oidc-context";
import { type z } from "zod";
import { toUrlSearchParams } from "../../utils/url-search-params";
import useAppContext from "../useAppContext";
import { type FetchError } from "./api-types";

function useApiFetch<SType>({
  schema,
}: {
  schema?: z.ZodType<SType>;
}): (params: { path: string; queryParams?: Record<string, string | number | boolean | undefined> }) => Promise<SType>;
function useApiFetch<SType>({ schema }: { schema?: z.ZodType<SType> }) {
  const { user } = useAuth();
  const { apiUrl } = useAppContext();

  const accessToken = user?.access_token;

  return async ({
    path,
    queryParams,
  }: { path: string; queryParams?: Record<string, string | number | boolean | undefined> }) => {
    const queryString = toUrlSearchParams(queryParams).toString();

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
  };
}

export default useApiFetch;
