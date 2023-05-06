import type * as Sentry from "@sentry/node";
import { type LoggedUser } from "../types/User.ts";

declare module "fastify" {
  interface FastifyRequest {
    user: LoggedUser | null;
    sentry: { transaction: Sentry.Transaction } | null;
  }
}
