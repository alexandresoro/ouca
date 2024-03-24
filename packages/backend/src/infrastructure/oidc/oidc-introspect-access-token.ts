import { oidcConfig } from "@infrastructure/config/oidc-config.js";
import { logger } from "../../utils/logger.js";

/**
 * Calls the OIDC introspection endpoint and returns the response body of the introspection result
 */
export const introspectAccessToken = async (accessToken: string): Promise<unknown> => {
  const basicAuthHeader = Buffer.from(`${oidcConfig.clientId}:${oidcConfig.clientSecret}`).toString("base64");

  const response = await fetch(`${oidcConfig.issuer}${oidcConfig.introspectionPath}`, {
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

  logger.trace(
    {
      status: response.status,
      jsonBody: responseBody,
      ok: response.ok,
    },
    "Token instrospection response",
  );

  return responseBody;
};
