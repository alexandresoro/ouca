import type { OIDCIntrospectionResult } from "@domain/oidc/oidc-introspection.js";
import { oidcConfig } from "@infrastructure/config/oidc-config.js";
import { parseZitadelIntrospectionResult } from "@infrastructure/oidc/zitadel/oidc-zitadel.js";
import { type Result, err, fromPromise, ok } from "neverthrow";
import { logger } from "../../utils/logger.js";

const fetchIntrospectAccessToken = async (
  accessToken: string,
): Promise<Result<unknown, "fetchError" | "parseError">> => {
  const basicAuthHeader = Buffer.from(`${oidcConfig.clientId}:${oidcConfig.clientSecret}`).toString("base64");

  const responseResult = await fromPromise(
    fetch(`${oidcConfig.issuer}${oidcConfig.introspectionPath}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuthHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token: accessToken,
      }),
    }),
    (error) => {
      logger.error({ error }, "An error has occurred while trying to fetch the introspection endpoint");
      return "fetchError" as const;
    },
  );

  if (responseResult.isErr()) {
    return err(responseResult.error);
  }

  const response = responseResult.value;

  const responseBodyResult = await fromPromise(response.json(), (error) => {
    logger.error({ error }, "An error has occurred while trying to parse the introspection result");
    return "parseError" as const;
  });

  if (responseBodyResult.isErr()) {
    return err(responseBodyResult.error);
  }

  const responseBody = responseBodyResult.value;

  logger.trace(
    {
      status: response.status,
      jsonBody: responseBody,
      ok: response.ok,
    },
    "Token instrospection response",
  );

  return ok(responseBody);
};

/**
 * Calls the OIDC introspection endpoint and returns the response body of the introspection result
 */
export const introspectAccessToken = async (
  accessToken: string,
): Promise<
  Result<OIDCIntrospectionResult, "fetchIntrospectionError" | "providerConfigurationError" | "zodSchemaParseError">
> => {
  const introspectionResult = await fetchIntrospectAccessToken(accessToken);

  if (introspectionResult.isErr()) {
    return err("fetchIntrospectionError");
  }

  const introspectionToken = introspectionResult.value;

  switch (oidcConfig.provider) {
    case "zitadel": {
      return parseZitadelIntrospectionResult(introspectionToken);
    }
    default: {
      return err("providerConfigurationError");
    }
  }
};
