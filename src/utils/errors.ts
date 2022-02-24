const ERRORS = {
  OUCA0001: "User is not allowed to perform operation",
  OUCA0002: "No matching user has been found",
  OUCA0003: "The provided password is incorrect"
};

export type ErrorCode = keyof typeof ERRORS;

export class OucaError extends Error {
  constructor(name: ErrorCode) {
    super();
    this.name = name;
    this.message = ERRORS[name];
  }
}
