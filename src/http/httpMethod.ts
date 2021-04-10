export const GET = "GET";

export const POST = "POST";

export const DELETE = "DELETE";

const HTTP_METHODS = [GET, POST, DELETE] as const;

export type HttpMethod = typeof HTTP_METHODS[number];

