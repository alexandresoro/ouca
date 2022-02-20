const ERRORS = {
  OUCA0001: "User is not allowed to perform operation"
};

export type ErrorCode = keyof typeof ERRORS;

export class OucaError extends Error {
  constructor(name: ErrorCode) {
    super();
    this.name = name;
    this.message = ERRORS[name];
  }
}
