import { OucaError } from "@domain/errors/ouca-error.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { validateAuthorization } from "./authorization-utils.js";

describe("General access check to the API", () => {
  test("should throw an error when login information is not defined", () => {
    expect(() => validateAuthorization(undefined)).toThrowError(new OucaError("OUCA0001"));
  });

  test("should throw an error when login information is null", () => {
    expect(() => validateAuthorization(null)).toThrowError(new OucaError("OUCA0001"));
  });

  test("should not throw anything when credentials are provided", () => {
    const loginInfo = loggedUserFactory.build();
    expect(() => validateAuthorization(loginInfo)).not.toThrowError();
  });
});
