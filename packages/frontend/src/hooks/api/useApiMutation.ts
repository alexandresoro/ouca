import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { type z } from "zod";
import useAppContext from "../useAppContext";

function useApiMutation<V extends { path: string }>(
  { method }: { method: string; responseHandler?: never },
  queryOptions: Omit<UseMutationOptions, "mutationFn">
): UseMutationResult<unknown, unknown, V>;
function useApiMutation<V extends { path: string }, SType>(
  { method }: { method: string; responseHandler?: never },
  options: Omit<UseMutationOptions<SType>, "mutationFn"> & { schema?: z.ZodType<SType> }
): UseMutationResult<SType, unknown, V>;
function useApiMutation<V extends { path: string }, R>(
  { method, responseHandler }: { method: string; responseHandler: (response: Response) => R | Promise<R> },
  options: Omit<UseMutationOptions<R>, "mutationFn">
): UseMutationResult<R, unknown, V>;
function useApiMutation<V extends { path: string }, SType, R>(
  { method, responseHandler }: { method: string; responseHandler?: (response: Response) => R | Promise<R> },
  options: Omit<UseMutationOptions<unknown, unknown, V>, "mutationFn"> & { schema?: z.ZodType<SType> } = {}
) {
  const { user } = useAuth();
  const { apiUrl } = useAppContext();

  const { schema, ...mutationOptions } = options;

  const accessToken = user?.access_token;

  return useMutation({
    ...mutationOptions,
    mutationFn: async (variables) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { path, ...restVariables } = variables;

      const response = await fetch(`${apiUrl}/api/v1${path}`, {
        method,
        headers: {
          ...(accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {}),
        },
      });

      if (typeof responseHandler === "function") {
        return responseHandler(response);
      }

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

export default useApiMutation;
