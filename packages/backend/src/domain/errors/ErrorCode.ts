/**
 * @deprecated use operation/result pattern instead
 */
const ERRORS = {
  OUCA0001: "User is not allowed to perform operation",
  OUCA0004: "An issue has occurred with the database update.",
};

/**
 * @deprecated use operation/result pattern instead
 */
export type ErrorCode = keyof typeof ERRORS;

/**
 * @deprecated use operation/result pattern instead
 */
export const getErrorMessage = (code: ErrorCode): string => {
  return ERRORS[code];
};
