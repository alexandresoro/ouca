import { FastifyReply, FastifyRequest } from "fastify";
import mercurius from "mercurius";
import {
  deleteTokenCookie,
  getLoggedUserInfo,
  LoggedUserInfo,
  validateAndExtractUserToken,
} from "../services/token-service";

type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

declare module "mercurius" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface MercuriusContext extends PromiseType<ReturnType<typeof buildGraphQLContext>> {}
}

export type GraphQLContext = {
  request: FastifyRequest;
  reply: FastifyReply;
  user: LoggedUserInfo | null;
};

export const buildGraphQLContext = async (request: FastifyRequest, reply: FastifyReply): Promise<GraphQLContext> => {
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
    user: tokenPayload ? getLoggedUserInfo(tokenPayload) : null,
  };
};
