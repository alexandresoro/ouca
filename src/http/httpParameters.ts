import { ParsedUrlQuery } from "querystring";

export interface HttpParameters<T = unknown> {
  queryParameters: ParsedUrlQuery;

  postData?: T;

  // The name of the input file, when the content included is a file upload
  inputFileName?: string;
}
