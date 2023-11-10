import type * as Sentry from "@sentry/node";
import { type LoggedUser } from "../types/User.ts";

declare module "fastify" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface FastifyRequest {
    user: LoggedUser | null;
    sentry: { transaction: Sentry.Transaction } | null;
  }
}
