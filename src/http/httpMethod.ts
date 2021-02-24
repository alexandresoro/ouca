import * as http from "http";
import * as url from "url";
import { REQUEST_METHODS } from "../mapping";

export const GET = "GET";

export const POST = "POST";

export const OPTIONS = "OPTIONS";

export const DELETE = "DELETE";

const HTTP_METHODS = [GET, POST, OPTIONS, DELETE] as const;

export type HttpMethod = typeof HTTP_METHODS[number];

export const checkMethodValidity = (request: http.IncomingMessage): boolean => {
  const pathName = url.parse(request.url).pathname;

  const validMethods = REQUEST_METHODS[pathName];

  if (!validMethods) {
    // Method is not validated
    return true;
  }

  return validMethods.includes(request.method as HttpMethod);
};
