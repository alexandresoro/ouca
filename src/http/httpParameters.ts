import { ParsedUrlQuery } from "querystring";

export interface HttpParameters {
  queryParameters: ParsedUrlQuery;

  postData?: any;
}
