import { ParsedUrlQuery } from "querystring";

export interface HttpParameters {
  queryParameters: ParsedUrlQuery;

  postData?: any;

  // The name of the input file, when the content included is a file upload
  inputFileName?: string;
}
