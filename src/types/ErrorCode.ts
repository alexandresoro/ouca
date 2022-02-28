const ERRORS = {
  OUCA0001: "User is not allowed to perform operation",
  OUCA0002: "No matching user has been found",
  OUCA0003: "The provided password is incorrect",
  OUCA0004: "An issue has occurred with the database update."
};

export type ErrorCode = keyof typeof ERRORS;

export const getErrorMessage = (code: ErrorCode): string => {
  return ERRORS[code];
};
