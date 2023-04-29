import { type FastifyReply, type FastifyRequest } from "fastify";
import { type LoggedUser } from "../types/User.js";

export type GraphQLContext = {
  request: FastifyRequest;
  reply: FastifyReply;
  user: LoggedUser | null;
};

export const buildGraphQLContext =
  () => async (request: FastifyRequest, reply: FastifyReply): Promise<GraphQLContext> => {
    return {
      request,
      reply,
      user: request.user,
    };
  };
