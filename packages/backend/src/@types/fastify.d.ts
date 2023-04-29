import { type User } from "../types/User.ts";

declare module "fastify" {
  interface FastifyRequest {
    user: User | null;
  }
}
