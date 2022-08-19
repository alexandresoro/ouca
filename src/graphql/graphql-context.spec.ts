import { AuthenticationError } from "apollo-server-core";
import { FastifyReply, FastifyRequest } from "fastify";
import { mock } from "jest-mock-extended";
import { JWTPayload } from "jose";
import { deleteTokenCookie, validateAndExtractUserToken } from "../services/token-service";
import { getGraphQLContext, GraphQLContext } from "./graphql-context";

jest.mock("../services/token-service", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actualModule = jest.requireActual("../services/token-service");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    __esModule: true,
    ...actualModule,
    validateAndExtractUserToken: jest.fn(),
    deleteTokenCookie: jest.fn(),
  };
});

const mockedValidateAndExtractUserToken = jest.mocked(validateAndExtractUserToken, true);
const mockedDeleteTokenCookie = jest.mocked(deleteTokenCookie, true);

describe("GraphQL context", () => {
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
