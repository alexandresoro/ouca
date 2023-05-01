import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { type z } from "zod";
import useAppContext from "../useAppContext";

function useApiMutation<V extends { path: string }>(
  { method }: { method: string },
  queryOptions: Omit<UseMutationOptions, "mutationFn">
): UseMutationResult<unknown, unknown, V>;
function useApiMutation<V extends { path: string }, SType>(
  { method }: { method: string },
  options: Omit<UseMutationOptions, "mutationFn"> & { schema?: z.ZodType<SType> }
): UseMutationResult<SType, unknown, V>;
function useApiMutation<V extends { path: string }, SType>(
  { method }: { method: string },
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
