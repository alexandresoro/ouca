import type { FastifyRequest } from "fastify";
import { jwtVerify, type JWTPayload, type JWTVerifyResult, type ResolvedKey } from "jose";
import { TextEncoder } from "node:util";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseRole, type User } from "../types/User";
import { buildTokenService } from "./token-service";
import { type UserService } from "./user-service";

const userService = mock<UserService>({
  getUser: vi.fn(),
});

const tokenService = buildTokenService({
  userService,
});

vi.mock("jose", async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actualModule = await vi.importActual<typeof import("jose")>("jose");
  return {
    ...actualModule,
    jwtVerify: vi.fn(),
  };
});

const mockedJwtVerify = vi.mocked(jwtVerify);

describe("Token validation and extraction", () => {
  test("should handle validation and extraction when missing token", async () => {
    const request = mock<FastifyRequest>({
      cookies: {
        token: undefined,
      },
    });

    const tokenPayload = await tokenService.validateAndExtractUserToken(request);

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

    await expect(() => tokenService.validateAndExtractUserToken(request)).rejects.toThrowError();
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
    userService.getUser.mockResolvedValueOnce(dbUser);

    const request = mock<FastifyRequest>({
      cookies: {
        token: "toto",
      },
    });

    const tokenPayload = await tokenService.validateAndExtractUserToken(request);

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

    userService.getUser.mockResolvedValue(null);

    const request = mock<FastifyRequest>({
      cookies: {
        token: "toto",
      },
    });

    await expect(() => tokenService.validateAndExtractUserToken(request)).rejects.toThrowError();
  });

  test("should throw an error when validating and extracting a token with matching user not found", async () => {
    const result = mock<JWTVerifyResult & ResolvedKey>({
      payload: {
        sub: "toto",
        roles: "titi",
      },
    });
    mockedJwtVerify.mockResolvedValueOnce(result);

    userService.getUser.mockResolvedValue(null);

    const request = mock<FastifyRequest>({
      cookies: {
        token: "toto",
      },
    });

    await expect(() => tokenService.validateAndExtractUserToken(request)).rejects.toThrowError();
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
    userService.getUser.mockResolvedValueOnce(dbUser);

    const request = mock<FastifyRequest>({
      cookies: {
        token: "toto",
      },
    });

    await expect(() => tokenService.validateAndExtractUserToken(request)).rejects.toThrowError();
  });
});
