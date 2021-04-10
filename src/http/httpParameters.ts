import { ParsedUrlQuery } from "querystring";

export type HttpParameters<T = unknown> = {
  query: ParsedUrlQuery,

  body?: T
}
