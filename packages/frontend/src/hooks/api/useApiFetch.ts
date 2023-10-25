import { useAuth } from "react-oidc-context";
import { type z } from "zod";
import fetchApi from "../../utils/fetch-api";
import { toUrlSearchParams } from "../../utils/url-search-params";
import useAppContext from "../useAppContext";

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

    return fetchApi({
      url: `${apiUrl}/api/v1${path}${queryString.length ? `?${queryString}` : ""}`,
      token: accessToken,
      schema,
    });
  };
}

export default useApiFetch;
