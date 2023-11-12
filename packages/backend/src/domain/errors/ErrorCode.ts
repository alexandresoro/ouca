const ERRORS = {
  OUCA0001: "User is not allowed to perform operation",
  OUCA0004: "An issue has occurred with the database update.",
  OUCA0005: "Unable to delete entity as it is still used",
};

export type ErrorCode = keyof typeof ERRORS;

export const getErrorMessage = (code: ErrorCode): string => {
  return ERRORS[code];
};
