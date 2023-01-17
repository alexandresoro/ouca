import type { FastifyReply, FastifyRequest } from "fastify";
import { type JWTPayload } from "jose";
import mercurius from "mercurius";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type LoggedUserInfo, type TokenService } from "../services/token-service";
import { buildGraphQLContext, type GraphQLContext } from "./graphql-context";

const tokenService = mock<TokenService>({
  getLoggedUserInfo: vi.fn(),
  validateAndExtractUserToken: vi.fn(),
  deleteTokenCookie: vi.fn(),
});

const graphQLContext = buildGraphQLContext({
  tokenService,
});

describe("GraphQL context", () => {
  test("should return correct context when no token retrieved", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    tokenService.validateAndExtractUserToken.mockResolvedValueOnce(null);

    const context = await graphQLContext(request, reply);

    expect(context).toEqual<GraphQLContext>({
      request,
      reply,
      user: null,
    });
  });

  test("should return correct context a token is retrieved", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    const tokenPayload = mock<JWTPayload>();
    const userInfo = mock<LoggedUserInfo>();

    tokenService.validateAndExtractUserToken.mockResolvedValueOnce(tokenPayload);
    tokenService.getLoggedUserInfo.mockReturnValueOnce(userInfo);

    const context = await graphQLContext(request, reply);

    expect(tokenService.getLoggedUserInfo).toHaveBeenLastCalledWith(tokenPayload);
    expect(context).toEqual<GraphQLContext>({
      request,
      reply,
      user: userInfo,
    });
  });

  test("should throw an error and request cookie deletion when an invalid token is detected", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    const rejection = mock<string>();

    tokenService.validateAndExtractUserToken.mockRejectedValueOnce(rejection);

    await expect(() => graphQLContext(request, reply)).rejects.toThrowError(new mercurius.ErrorWithProps(rejection));
    expect(tokenService.deleteTokenCookie).toHaveBeenCalledTimes(1);
  });
});
