import { mock } from "vitest-mock-extended";
import { type LoggedUser } from "../../types/User.js";
import { OucaError } from "../../utils/errors.js";
import { validateAuthorization } from "./authorization-utils.js";

describe("General access check to the API", () => {
  test("should throw an error when login information is not defined", () => {
    expect(() => validateAuthorization(undefined)).toThrowError(new OucaError("OUCA0001"));
  });

  test("should throw an error when login information is null", () => {
    expect(() => validateAuthorization(null)).toThrowError(new OucaError("OUCA0001"));
  });

  test("should not throw anything when credentials are provided", () => {
    const loginInfo = mock<LoggedUser>();
    expect(() => validateAuthorization(loginInfo)).not.toThrowError();
  });
});
