import { AuthenticationError } from "apollo-server-core";
import { FastifyReply, FastifyRequest } from "fastify";
import { mock } from "jest-mock-extended";
import { JWTPayload } from "jose";
import * as tokenService from "../services/token-service";
import { getGraphQLContext, GraphQLContext } from "./graphql-context";

const validateAndExtractUserToken = jest.spyOn(tokenService, "validateAndExtractUserToken");
const deleteTokenCookie = jest.spyOn(tokenService, "deleteTokenCookie");

describe("GraphQL context", () => {
  test("should return correct context when no token retrieved", async () => {
    const request = mock<FastifyRequest>();
    const reply = mock<FastifyReply>();

    validateAndExtractUserToken.mockResolvedValueOnce(null);

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

    validateAndExtractUserToken.mockResolvedValueOnce(tokenPayload);

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

    validateAndExtractUserToken.mockRejectedValueOnce(rejection);

    await expect(() => getGraphQLContext({ request, reply })).rejects.toThrowError(new AuthenticationError(rejection));
    expect(deleteTokenCookie).toHaveBeenCalledTimes(1);
  });
});
