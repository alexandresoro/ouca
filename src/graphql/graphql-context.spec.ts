import { AuthenticationError } from "apollo-server-core";
import { FastifyReply, FastifyRequest } from "fastify";
import { mock } from "jest-mock-extended";
import { JWTPayload } from "jose";
import { deleteTokenCookie, validateAndExtractUserToken } from "../services/token-service";
import { buildGraphQLContext, getGraphQLContext, GQLContext, GraphQLContext } from "./graphql-context";

jest.mock<typeof import("../services/token-service")>("../services/token-service", () => {
  const actualModule = jest.requireActual<typeof import("../services/token-service")>("../services/token-service");
  return {
    __esModule: true,
    ...actualModule,
    validateAndExtractUserToken: jest.fn(),
    deleteTokenCookie: jest.fn(),
  };
});

const mockedValidateAndExtractUserToken = jest.mocked(validateAndExtractUserToken, true);
const mockedDeleteTokenCookie = jest.mocked(deleteTokenCookie, true);

describe("GraphQL context - Apollo", () => {
  test("should return correct context when no token retrieved", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    mockedValidateAndExtractUserToken.mockResolvedValueOnce(null);

    const context = await getGraphQLContext({ request, reply });

    expect(context).toEqual<GraphQLContext>({
      request,
      reply,
      user: null,
      username: null,
    });
  });

  test("should return correct context a token is retrieved", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    const tokenPayload = mock<JWTPayload>();

    mockedValidateAndExtractUserToken.mockResolvedValueOnce(tokenPayload);

    const context = await getGraphQLContext({ request, reply });

    expect(context).toEqual<GraphQLContext>({
      request,
      reply,
      user: context.user,
      username: context.username,
    });
  });

  test("should throw an error and request cookie deletion when an invalid token is detected", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    const rejection = mock<string>();

    mockedValidateAndExtractUserToken.mockRejectedValueOnce(rejection);

    await expect(() => getGraphQLContext({ request, reply })).rejects.toThrowError(new AuthenticationError(rejection));
    expect(mockedDeleteTokenCookie).toHaveBeenCalledTimes(1);
  });
});

describe("GraphQL context - Mercurius", () => {
  test("should return correct context when no token retrieved", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    mockedValidateAndExtractUserToken.mockResolvedValueOnce(null);

    const context = await buildGraphQLContext(request, reply);

    expect(context).toEqual<GQLContext>({
      request,
      reply,
      user: null,
      username: null,
    });
  });

  test("should return correct context a token is retrieved", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    const tokenPayload = mock<JWTPayload>();

    mockedValidateAndExtractUserToken.mockResolvedValueOnce(tokenPayload);

    const context = await buildGraphQLContext(request, reply);

    expect(context).toEqual<GQLContext>({
      request,
      reply,
      user: context.user,
      username: context.username,
    });
  });

  test("should throw an error and request cookie deletion when an invalid token is detected", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    const rejection = mock<string>();

    mockedValidateAndExtractUserToken.mockRejectedValueOnce(rejection);

    await expect(() => buildGraphQLContext(request, reply)).rejects.toThrowError(new AuthenticationError(rejection));
    expect(mockedDeleteTokenCookie).toHaveBeenCalledTimes(1);
  });
});
