import type { z } from "zod";

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
  body?: Record<string, unknown> | FormData;
  token?: string;
}): Promise<Response> => {
  const response = await fetch(url, {
    method,
    headers: {
      ...(body !== undefined && !(body instanceof FormData)
        ? { "Content-Type": "application/json; charset=utf-8" }
        : {}),
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    ...(body != null ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    return Promise.reject(new FetchError({ status: response.status, statusText: response.statusText }));
  }

  return response;
};

export const fetchApi = async <T = unknown>({
  url,
  method,
  body,
  token,
  schema,
}: {
  url: string;
  method?: string;
  body?: Record<string, unknown> | FormData;
  token?: string;
  schema?: z.ZodType<T>;
}): Promise<T> => {
  const response = await fetchApiResponse({ url, method, body, token });

  const jsonResponse = await (response.json() as Promise<T>);
  if (schema) {
    // If response schema is provided, use it
    return schema.parse(jsonResponse);
  }

  return jsonResponse;
};
