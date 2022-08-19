import { DatabaseRole, User } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { mock } from "jest-mock-extended";
import { JWTPayload, jwtVerify, JWTVerifyResult, ResolvedKey } from "jose";
import { TextEncoder } from "util";
import { validateAndExtractUserToken } from "./token-service";
import { getUser } from "./user-service";

jest.mock<typeof import("./user-service")>("./user-service", () => {
  const actualModule = jest.requireActual<typeof import("./user-service")>("./user-service");
  return {
    __esModule: true,
    ...actualModule,
    getUser: jest.fn(),
  };
});

jest.mock<typeof import("jose")>("jose", () => {
  const actualModule = jest.requireActual<typeof import("jose")>("jose");
  return {
    __esModule: true,
    ...actualModule,
    jwtVerify: jest.fn(),
  };
});

const mockedGetUser = jest.mocked(getUser, true);
const mockedJwtVerify = jest.mocked(jwtVerify, true);

describe("Token validation and extraction", () => {
  test("should handle validation and extraction when missing token", async () => {
    const request = mock<FastifyRequest>({
      cookies: {
        token: undefined,
      },
    });

    const tokenPayload = await validateAndExtractUserToken(request);

    expect(tokenPayload).toBeNull();
  });

  test("should throw error on validation and extraction of invalid token", async () => {
    mockedJwtVerify.mockImplementation(() => {
      throw new Error();
    });

    const request = mock<FastifyRequest>({
      cookies: {
        token: "toto",
      },
    });

    await expect(() => validateAndExtractUserToken(request)).rejects.toThrowError();
  });

  test("should handle validation and extraction of valid token", async () => {
    const result = mock<JWTVerifyResult & ResolvedKey>({
      payload: {
        sub: "toto",
        roles: "titi",
      },
      protectedHeader: {
        alg: "",
      },
      key: new TextEncoder().encode("toto"),
    });
    mockedJwtVerify.mockResolvedValueOnce(result);

    const dbUser = mock<User>({
      id: result.payload.sub,
      role: result.payload.roles as DatabaseRole,
    });
    mockedGetUser.mockResolvedValueOnce(dbUser);

    const request = mock<FastifyRequest>({
      cookies: {
        token: "toto",
      },
    });

    const tokenPayload = await validateAndExtractUserToken(request);

    expect(tokenPayload).toEqual<JWTPayload>(result.payload);
  });

  test("should throw an error when validating and extracting a token that has no sub", async () => {
    const result = mock<JWTVerifyResult & ResolvedKey>({
      payload: {
        sub: undefined,
        roles: "titi",
      },
    });
    mockedJwtVerify.mockResolvedValueOnce(result);

    mockedGetUser.mockResolvedValue(null);

    const request = mock<FastifyRequest>({
      cookies: {
        token: "toto",
      },
    });

    await expect(() => validateAndExtractUserToken(request)).rejects.toThrowError();
  });

  test("should throw an error when validating and extracting a token with matching user not found", async () => {
    const result = mock<JWTVerifyResult & ResolvedKey>({
      payload: {
        sub: "toto",
        roles: "titi",
      },
    });
    mockedJwtVerify.mockResolvedValueOnce(result);

    mockedGetUser.mockResolvedValue(null);

    const request = mock<FastifyRequest>({
      cookies: {
        token: "toto",
      },
    });

    await expect(() => validateAndExtractUserToken(request)).rejects.toThrowError();
  });

  test("should throw an error when validating and extracting a token with user having different role", async () => {
    const result = mock<JWTVerifyResult & ResolvedKey>({
      payload: {
        sub: "toto",
        roles: "titi",
      },
    });
    mockedJwtVerify.mockResolvedValueOnce(result);

    const dbUser = mock<User>({
      id: result.payload.sub,
      role: "differentRole" as DatabaseRole,
    });
    mockedGetUser.mockResolvedValueOnce(dbUser);

    const request = mock<FastifyRequest>({
      cookies: {
        token: "toto",
      },
    });

    await expect(() => validateAndExtractUserToken(request)).rejects.toThrowError();
  });
});
