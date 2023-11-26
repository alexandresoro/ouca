import { type z } from "zod";

export class FetchError extends Error {
  status: number;
  statusText?: string;

  constructor({ status, statusText }: { status: number; statusText?: string }) {
    super(`Fetch error: ${status} ${statusText}`);
    this.status = status;
    this.statusText = statusText;
  }
}

export const fetchApiResponse = async ({
  url,
  method,
  body,
  token,
}: {
  url: string;
  method?: string;
  body?: Record<string, unknown>;
  token?: string;
}): Promise<Response> => {
  const response = await fetch(url, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json; charset=utf-8" } : {}),
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    return Promise.reject(new FetchError({ status: response.status, statusText: response.statusText }));
  }

  return response;
};

const fetchApi = async <T = unknown>({
  url,
  method,
  body,
  token,
  schema,
}: {
  url: string;
  method?: string;
  body?: Record<string, unknown>;
  token?: string;
  schema?: z.ZodType<T>;
}): Promise<T> => {
  const response = await fetchApiResponse({ url, method, body, token });

  const jsonResponse = await (response.json() as Promise<T>);
  if (schema) {
    // If response schema is provided, use it
    return schema.parse(jsonResponse);
  } else {
    return jsonResponse;
  }
};

/**
 * @deprecated use FetchError class instead
 */
export type FetchErrorType = {
  status: number;
  statusText?: string;
};

export default fetchApi;
