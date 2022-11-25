import { mock } from "jest-mock-extended";
import { type LoggedUser } from "../../types/LoggedUser";
import { OucaError } from "../../utils/errors";
import { validateAuthorization } from "./authorization-utils";

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
