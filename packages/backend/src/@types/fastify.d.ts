import type { LoggedUser } from "@domain/user/logged-user.ts";
import type * as Sentry from "@sentry/node";

declare module "fastify" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface FastifyRequest {
    user: LoggedUser | null;
    sentry: { transaction: Sentry.Transaction } | null;
  }
}
