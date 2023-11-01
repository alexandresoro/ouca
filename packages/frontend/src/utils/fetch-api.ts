import { type z } from "zod";

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
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    return Promise.reject({
      status: response.status,
      statusText: response.statusText,
    } satisfies FetchError);
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

export type FetchError = {
  status: number;
  statusText?: string;
};

export default fetchApi;
