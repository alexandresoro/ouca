import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { type z } from "zod";
import useAppContext from "../useAppContext";
import { type FetchError } from "./api-types";

type MutationParamsSchema<R> = {
  path?: string;
  method: string;
  responseHandler?: never;
  schema?: z.ZodType<R>;
};

type MutationParamsResponseHandler<R> = {
  path?: string;
  method: string;
  responseHandler: (response: Response) => R | Promise<R>;
  schema?: never;
};

type MutationParams<R> = MutationParamsSchema<R> | MutationParamsResponseHandler<R>;

type MutationVariables = { path?: string; body?: Record<string, unknown> };

function useApiMutation<TData, TVariables extends MutationVariables>(
  { path, method }: MutationParamsSchema<TData>,
  mutationOptions?: Omit<UseMutationOptions<TData, FetchError, TVariables>, "mutationFn">
): UseMutationResult<TData, FetchError, TVariables>;
function useApiMutation<TData, TVariables extends MutationVariables>(
  { path, method, responseHandler }: MutationParamsResponseHandler<TData>,
  mutationOptions?: Omit<UseMutationOptions<TData, unknown, TVariables>, "mutationFn">
): UseMutationResult<TData, unknown, TVariables>;
function useApiMutation<TData, TError, TVariables extends MutationVariables>(
  { path: pathFromOptions, method, responseHandler, schema }: MutationParams<TData>,
  mutationOptions?: Omit<UseMutationOptions<unknown, TError, TVariables>, "mutationFn">
): UseMutationResult<unknown, TError, TVariables> {
  const { user } = useAuth();
  const { apiUrl } = useAppContext();

  const accessToken = user?.access_token;

  return useMutation<unknown, TError, TVariables>({
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

export default useApiMutation;
