import { type z } from "zod";
import config from "../../config.js";

/**
 * Calls the OIDC introspection endpoint and returns the response of the introspection
 * @param accessToken the access token to introspect
 */
const introspectAccessToken = async <T extends z.ZodType<Output>, Output>(
  accessToken: string,
  introspectionResultSchema: T
): Promise<z.infer<typeof introspectionResultSchema>> => {
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

  const parsedResponse = introspectionResultSchema.parse(responseBody);

  return parsedResponse;
};

export default introspectAccessToken;
