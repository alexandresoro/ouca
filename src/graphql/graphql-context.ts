import { AuthenticationError, Context } from "apollo-server-core";
import { FastifyReply, FastifyRequest } from "fastify";
import { deleteTokenCookie, getLoggedUser, validateAndExtractUserToken } from "../services/token-service";
import { LoggedUser } from "../types/LoggedUser";

export type GraphQLContext = Context<{
  request: FastifyRequest;
  reply: FastifyReply;
  user: LoggedUser | null;
  username: string | null;
}>;

export const getGraphQLContext = async ({
  request,
  reply,
}: {
  request: FastifyRequest;
  reply: FastifyReply;
}): Promise<GraphQLContext> => {
  // Extract the token from the authentication cookie, if any
  const tokenPayload = await validateAndExtractUserToken(request).catch((e) => {
    // If the validation has thrown an error
    // Make sure that the cookie is deleted in order to avoid sending it again
    void deleteTokenCookie(reply);
    throw new AuthenticationError(e as string);
  });

  return {
    request,
    reply,
    user: tokenPayload ? getLoggedUser(tokenPayload) : null,
    username: (tokenPayload?.name as string) ?? null,
  };
};
