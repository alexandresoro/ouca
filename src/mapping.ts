import { creationInit } from "./creation";

export const REQUEST_MAPPING: {
  [path: string]: (
    isMockDatabaseMode: boolean,
    callbackFn?: (errors, result) => void
  ) => void;
} = {
  "/api/creation/init": creationInit
};
