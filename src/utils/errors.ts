import { ErrorCode, getErrorMessage } from "../types/ErrorCode";

type SubError = {
  code: string;
  message: string;
};

export class OucaError extends Error {
  subError?: SubError;

  constructor(code: ErrorCode, subError?: SubError) {
    super();
    this.name = code;
    this.message = subError?.message ?? getErrorMessage(code);
    this.subError = subError;
  }
}
