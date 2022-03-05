import { AuthenticationError, Context } from "apollo-server-core";
import { FastifyReply, FastifyRequest } from "fastify";
import { JWTPayload, jwtVerify } from "jose";
import { deleteTokenCookie, getLoggedUser } from "../services/token-service";
import { getUser } from "../services/user-service";
import { LoggedUser } from "../types/LoggedUser";
import { TokenKeys } from "../utils/keys";

export type GraphQLContext = Context<{
  request: unknown;
  reply: FastifyReply;
  user: LoggedUser | null;
  username: string | null;
}>;

const validateAndExtractUserToken = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<JWTPayload | null> => {
  // Extract the token from the authentication cookie, if any
  const token = request.cookies["token"];
  if (token) {
    const publicKey = await TokenKeys.getKey();
    const tokenVerifyResult = await jwtVerify(token, publicKey).catch((e) => {
      // If the user has sent a token that could not be validated,
      // make sure that at least the cookie is deleted
      void deleteTokenCookie(reply);
      throw e;
    });

    return tokenVerifyResult.payload;
  }

  return null;
};

export const getGraphQLContext = async ({
  request,
  reply
}: {
  request: FastifyRequest;
  reply: FastifyReply;
}): Promise<GraphQLContext> => {
  // Extract the token from the authentication cookie, if any
  const tokenPayload = await validateAndExtractUserToken(request, reply).catch((e) => {
    throw new AuthenticationError(e as string);
  });

  // Check that the user still exists in the database and has a valid role
  if (tokenPayload?.sub) {
    const matchingDbUser = await getUser(tokenPayload.sub);

    if (!matchingDbUser || matchingDbUser?.role !== tokenPayload.roles) {
      void deleteTokenCookie(reply);
      throw new AuthenticationError("Authentication credentials are invalid");
    }
  }

  return {
    request,
    reply,
    user: tokenPayload ? getLoggedUser(tokenPayload) : null,
    username: (tokenPayload?.name as string) ?? null
  };
};
