import { introspectAccessToken as introspectAccessTokenFetch } from "@infrastructure/oidc/oidc-introspect-access-token.js";
import type { z } from "zod";

/**
 * Calls the OIDC introspection endpoint and returns the response of the introspection
 * @param accessToken the access token to introspect
 */
export const introspectAccessToken = async <T extends z.ZodType<Output>, Output>(
  accessToken: string,
  introspectionResultSchema: T,
): Promise<z.infer<typeof introspectionResultSchema>> => {
  const responseBody = await introspectAccessTokenFetch(accessToken);

  const parsedResponse = introspectionResultSchema.parse(responseBody);

  return parsedResponse;
};
