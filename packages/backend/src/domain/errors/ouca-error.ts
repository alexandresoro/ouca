import { getErrorMessage, type ErrorCode } from "@domain/errors/ErrorCode.js";

type SubError =
  | {
      code: string;
      message: string;
    }
  | {
      readonly message: string;
      readonly cause?: Error;
    };

export class OucaError extends Error {
  subError?: SubError;

  extensions: {
    code: string;
    message?: string;
    subError?: SubError;
  };

  constructor(code: ErrorCode, subError?: SubError) {
    super();
    this.name = code;
    this.message = subError?.message ?? getErrorMessage(code);
    this.subError = subError;
    this.extensions = { code, message: subError?.message ?? getErrorMessage(code), subError };
  }
}