import { AuthenticationError, Context } from "apollo-server-core";
import { FastifyReply, FastifyRequest } from "fastify";
import { deleteTokenCookie, getLoggedUser, validateAndExtractUserToken } from "../services/token-service";
import { LoggedUser } from "../types/LoggedUser";

export type GraphQLContext = Context<{
  request: unknown;
  reply: FastifyReply;
  user: LoggedUser | null;
  username: string | null;
}>;

export const getGraphQLContext = async ({
  request,
  reply
}: {
  request: FastifyRequest;
  reply: FastifyReply;
}): Promise<GraphQLContext> => {
  // Extract the token from the authentication cookie, if any
  const tokenPayload = await validateAndExtractUserToken(request, reply).catch((e) => {
    void deleteTokenCookie(reply);
    throw new AuthenticationError(e as string);
  });

  return {
    request,
    reply,
    user: tokenPayload ? getLoggedUser(tokenPayload) : null,
    username: (tokenPayload?.name as string) ?? null
  };
};
