import { ErrorCode, getErrorMessage } from "../types/ErrorCode";

export class OucaError extends Error {
  constructor(name: ErrorCode) {
    super();
    this.name = name;
    this.message = getErrorMessage(name);
  }
}
