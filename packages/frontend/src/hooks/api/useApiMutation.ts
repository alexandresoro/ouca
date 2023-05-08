import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { type z } from "zod";
import useAppContext from "../useAppContext";

function useApiMutation<V extends { path?: string; body?: Record<string, unknown> }>(
  { path, method }: { path?: string; method: string; responseHandler?: never; schema?: never },
  mutationOptions: Omit<UseMutationOptions, "mutationFn">
): UseMutationResult<unknown, unknown, V>;
function useApiMutation<V extends { path?: string; body?: Record<string, unknown> }, SType>(
  { path, method }: { path?: string; method: string; responseHandler?: never; schema: z.ZodType<SType> },
  mutationOptions: Omit<UseMutationOptions<SType, unknown, V>, "mutationFn">
): UseMutationResult<SType, unknown, V>;
function useApiMutation<V extends { path?: string; body?: Record<string, unknown> }, R>(
  {
    path,
    method,
    responseHandler,
  }: { path?: string; method: string; responseHandler: (response: Response) => R | Promise<R>; schema?: never },
  mutationOptions?: Omit<UseMutationOptions<R>, "mutationFn">
): UseMutationResult<R, unknown, V>;
function useApiMutation<V extends { path?: string; body?: Record<string, unknown> }, SType, R>(
  {
    path: pathFromOptions,
    method,
    responseHandler,
    schema,
  }: {
    path?: string;
    method: string;
    responseHandler?: (response: Response) => R | Promise<R>;
    schema?: z.ZodType<SType>;
  },
  mutationOptions?: Omit<UseMutationOptions<unknown, unknown, V>, "mutationFn">
) {
  const { user } = useAuth();
  const { apiUrl } = useAppContext();

  const accessToken = user?.access_token;

  return useMutation({
    ...mutationOptions,
    mutationFn: async (variables) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { path: pathFromMutate, body, ...restVariables } = variables;

      const path = pathFromMutate ?? pathFromOptions;

      // TODO improve handling
      if (!path) {
        throw new Error("missing path param");
      }

      const response = await fetch(`${apiUrl}/api/v1${path}`, {
        method,
        headers: {
          ...(accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {}),
        },
        body: body ? JSON.stringify(body) : null,
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
