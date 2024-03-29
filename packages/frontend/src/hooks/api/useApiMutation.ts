import { apiUrlAtom } from "@services/api/useApiUrl";
import { type MutationFunction, type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type { FetchErrorType } from "@utils/fetch-api";
import { useAtomValue } from "jotai";
import { useAuth } from "react-oidc-context";
import type { z } from "zod";

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

const useApiMutation = <TData, TVariables extends MutationVariables, TError extends FetchErrorType = FetchErrorType>(
  { path: pathFromOptions, method, responseHandler, schema }: MutationParams<TData>,
  mutationOptions?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">,
) => {
  const { user } = useAuth();
  const apiUrl = useAtomValue(apiUrlAtom);

  const accessToken = user?.access_token;

  const mutationFn: MutationFunction<TData, TVariables> = async (variables) => {
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
        ...(body !== undefined ? { "Content-Type": "application/json; charset=utf-8" } : {}),
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
      } satisfies FetchErrorType);
    }
    const jsonResponse = (await response.json()) as TData;
    if (schema) {
      // If response schema is provided, use it
      return schema.parse(jsonResponse);
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      return jsonResponse;
    }
  };

  return useMutation({
    ...mutationOptions,
    mutationFn,
  });
};

export default useApiMutation;
