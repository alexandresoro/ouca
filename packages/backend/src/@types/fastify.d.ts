import { type LoggedUser } from "../types/User.ts";

declare module "fastify" {
  interface FastifyRequest {
    user: LoggedUser | null;
  }
}
