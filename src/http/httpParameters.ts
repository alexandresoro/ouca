import { ParsedUrlQuery } from "querystring";

export type HttpParameters<T = unknown> = {
  queryParameters: ParsedUrlQuery,

  postData?: T
}
