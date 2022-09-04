import { AuthenticationError, Context } from "apollo-server-core";
import { FastifyReply, FastifyRequest } from "fastify";
import mercurius from "mercurius";
import { deleteTokenCookie, getLoggedUser, validateAndExtractUserToken } from "../services/token-service";
import { LoggedUser } from "../types/LoggedUser";

type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

declare module "mercurius" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface MercuriusContext extends PromiseType<ReturnType<typeof buildGraphQLContext>> {}
}

export type GQLContext = {
  request: FastifyRequest;
  reply: FastifyReply;
  user: LoggedUser | null;
  username: string | null;
};

export type GraphQLContext = Context<GQLContext>;

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

export const buildGraphQLContext = async (request: FastifyRequest, reply: FastifyReply): Promise<GQLContext> => {
  // Extract the token from the authentication cookie, if any
  const tokenPayload = await validateAndExtractUserToken(request).catch((e) => {
    // If the validation has thrown an error
    // Make sure that the cookie is deleted in order to avoid sending it again
    void deleteTokenCookie(reply);
    throw new mercurius.ErrorWithProps(e as string);
  });

  return {
    request,
    reply,
    user: tokenPayload ? getLoggedUser(tokenPayload) : null,
    username: (tokenPayload?.name as string) ?? null,
  };
};
