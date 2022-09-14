import { DatabaseRole } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { mock } from "jest-mock-extended";
import { JWTPayload } from "jose";
import mercurius from "mercurius";
import { deleteTokenCookie, validateAndExtractUserToken } from "../services/token-service";
import { buildGraphQLContext, GraphQLContext } from "./graphql-context";

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

describe("GraphQL context", () => {
  test("should return correct context when no token retrieved", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    mockedValidateAndExtractUserToken.mockResolvedValueOnce(null);

    const context = await buildGraphQLContext(request, reply);

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

    mockedValidateAndExtractUserToken.mockResolvedValueOnce(tokenPayload);

    const context = await buildGraphQLContext(request, reply);

    expect(context).toEqual<GraphQLContext>({
      request,
      reply,
      user: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: tokenPayload.sub!,
        role: tokenPayload.roles as DatabaseRole,
        name: tokenPayload.name as string,
      },
    });
  });

  test("should throw an error and request cookie deletion when an invalid token is detected", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    const rejection = mock<string>();

    mockedValidateAndExtractUserToken.mockRejectedValueOnce(rejection);

    await expect(() => buildGraphQLContext(request, reply)).rejects.toThrowError(
      new mercurius.ErrorWithProps(rejection)
    );
    expect(mockedDeleteTokenCookie).toHaveBeenCalledTimes(1);
  });
});
