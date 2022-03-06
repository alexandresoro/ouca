import { DatabaseRole, User } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { mock, mockReset } from "jest-mock-extended";
import * as jose from "jose";
import { TextEncoder } from "util";
import { validateAndExtractUserToken } from "./token-service";
import * as userService from "./user-service";

const jwtVerify = jest.spyOn(jose, "jwtVerify");
const getUser = jest.spyOn(userService, "getUser");

beforeEach(() => {
  mockReset(jwtVerify);
  mockReset(getUser);
});

test("should handle validation and extraction when missing token", async () => {
  const request = mock<FastifyRequest>({
    cookies: {
      token: undefined
    }
  });

  const tokenPayload = await validateAndExtractUserToken(request);

  expect(tokenPayload).toBeNull();
});

test("should throw error on validation and extraction of invalid token", async () => {
  jwtVerify.mockImplementation(() => {
    throw new Error();
  });

  const request = mock<FastifyRequest>({
    cookies: {
      token: "toto"
    }
  });

  await expect(() => validateAndExtractUserToken(request)).rejects.toThrowError();
});

test("should handle validation and extraction of valid token", async () => {
  const result = mock<jose.JWTVerifyResult & jose.ResolvedKey>({
    payload: {
      sub: "toto",
      roles: "titi"
    },
    protectedHeader: {
      alg: ""
    },
    key: new TextEncoder().encode("toto")
  });
  jwtVerify.mockResolvedValueOnce(result);

  const dbUser = mock<User>({
    id: result.payload.sub,
    role: result.payload.roles as DatabaseRole
  });
  getUser.mockResolvedValueOnce(dbUser);

  const request = mock<FastifyRequest>({
    cookies: {
      token: "toto"
    }
  });

  const tokenPayload = await validateAndExtractUserToken(request);

  expect(tokenPayload).toEqual<jose.JWTPayload>(result.payload);
});

test("should throw an error when validating and extracting a token that has no sub", async () => {
  const result = mock<jose.JWTVerifyResult & jose.ResolvedKey>({
    payload: {
      sub: undefined,
      roles: "titi"
    }
  });
  jwtVerify.mockResolvedValueOnce(result);

  getUser.mockResolvedValue(null);

  const request = mock<FastifyRequest>({
    cookies: {
      token: "toto"
    }
  });

  await expect(() => validateAndExtractUserToken(request)).rejects.toThrowError();
});

test("should throw an error when validating and extracting a token with matching user not found", async () => {
  const result = mock<jose.JWTVerifyResult & jose.ResolvedKey>({
    payload: {
      sub: "toto",
      roles: "titi"
    }
  });
  jwtVerify.mockResolvedValueOnce(result);

  getUser.mockResolvedValue(null);

  const request = mock<FastifyRequest>({
    cookies: {
      token: "toto"
    }
  });

  await expect(() => validateAndExtractUserToken(request)).rejects.toThrowError();
});

test("should throw an error when validating and extracting a token with user having different role", async () => {
  const result = mock<jose.JWTVerifyResult & jose.ResolvedKey>({
    payload: {
      sub: "toto",
      roles: "titi"
    }
  });
  jwtVerify.mockResolvedValueOnce(result);

  const dbUser = mock<User>({
    id: result.payload.sub,
    role: "differentRole" as DatabaseRole
  });
  getUser.mockResolvedValueOnce(dbUser);

  const request = mock<FastifyRequest>({
    cookies: {
      token: "toto"
    }
  });

  await expect(() => validateAndExtractUserToken(request)).rejects.toThrowError();
});
