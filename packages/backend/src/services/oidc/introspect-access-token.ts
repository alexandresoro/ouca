import { z } from "zod";
import config from "../../config.js";

const introspectionResultSchema = z.object({
  active: z.boolean(),
});

export type IntrospectionResult = z.infer<typeof introspectionResultSchema>;

/**
 * Calls the OIDC introspection endpoint and returns the response of the introspection
 * @param accessToken the access token to introspect
 */
const introspectAccessToken = async (accessToken: string): Promise<IntrospectionResult> => {
  const basicAuthHeader = Buffer.from(`${config.oidc.clientId}:${config.oidc.clientSecret}`).toString("base64");

  const response = await fetch(`${config.oidc.issuer}${config.oidc.introspectionPath}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuthHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      token: accessToken,
    }),
  });
  const responseBody = await response.json();

  // TODO should we really use zod for that, as we need to list everything we need
  const parsedResponse = introspectionResultSchema.parse(responseBody);

  return parsedResponse;
};

export default introspectAccessToken;
