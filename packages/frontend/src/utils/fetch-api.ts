import { type z } from "zod";

const fetchApi = async <T = unknown>({
  url,
  token,
  schema,
}: { url: string; token: string; schema?: z.ZodType<T> }): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
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
