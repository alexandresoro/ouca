import { z } from "zod";
import { logger } from "../../utils/logger.js";

const envOidcSchema = z.object({
  OIDC_ISSUER: z.string(),
  OIDC_INTROSPECTION_PATH: z.string().default("/oauth/v2/introspect"),
  OIDC_CLIENT_ID: z.string(),
  OIDC_CLIENT_SECRET: z.string(),
});

export const getOidcConfig = () => {
  const envOidcParseResult = envOidcSchema.safeParse(process.env);
  if (!envOidcParseResult.success) {
    logger.fatal({ error: envOidcParseResult.error }, "An error has occurred when trying to parse the environment");
    process.exit(1);
  }
  const env = envOidcParseResult.data;
  return {
    issuer: env.OIDC_ISSUER,
    introspectionPath: env.OIDC_INTROSPECTION_PATH,
    clientId: env.OIDC_CLIENT_ID,
    clientSecret: env.OIDC_CLIENT_SECRET,
  };
};

export type OidcConfig = ReturnType<typeof getOidcConfig>;

export const oidcConfig = getOidcConfig();
