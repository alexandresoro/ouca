import { type LoggedUser } from "@domain/user/logged-user.js";
import { type UserRole, userRoles } from "@domain/user/user-role.js";
import { type OidcConfig } from "@infrastructure/config/oidc-config.js";
import { z } from "zod";
import introspectAccessTokenCommon from "./introspect-access-token.js";
import { type OidcWithInternalUserMappingService } from "./oidc-with-internal-user-mapping.js";

export const EXTERNAL_PROVIDER_NAME = "zitadel";

export const introspectionUser = z.object({
  sub: z.string(),
  iss: z.string(),
  username: z.string().optional(),
  exp: z.number(), // Expiration date as unix time
  email: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  name: z.string().optional(),
  "urn:zitadel:iam:org:project:roles": z
    .record(z.enum(userRoles), z.any())
    .optional()
    .transform((rolesMap) => (rolesMap ? Object.keys(rolesMap) : undefined)),
});

export type ZitadelIntrospectionUser = z.infer<typeof introspectionUser>;

export const introspectionResultSchema = z.union([
  z.object({
    active: z.literal(false),
  }),
  introspectionUser.merge(
    z.object({
      active: z.literal(true),
    })
  ),
]);

export type ZitadelIntrospectionResult = z.infer<typeof introspectionResultSchema>;

export type ZitadelOidcServiceDependencies = {
  oidcConfig: OidcConfig;
  oidcWithInternalUserMappingService: OidcWithInternalUserMappingService;
};

type GetMatchingLoggedUserResult =
  | {
      outcome: "notLogged";
      reason: "internalUserNotFound" | "userHasNoRole";
    }
  | {
      outcome: "success";
      user: LoggedUser;
    };

export const buildZitadelOidcService = ({
  oidcConfig,
  oidcWithInternalUserMappingService,
}: ZitadelOidcServiceDependencies) => {
  const introspectAccessToken = async (accessToken: string): Promise<ZitadelIntrospectionResult> => {
    return introspectAccessTokenCommon(accessToken, introspectionResultSchema, oidcConfig);
  };

  const getRoleFromLoggedUser = (introspectionUser: ZitadelIntrospectionUser): UserRole | null => {
    return (
      userRoles.find((existingRole) =>
        introspectionUser?.["urn:zitadel:iam:org:project:roles"]?.includes(existingRole)
      ) ?? null
    );
  };

  const getMatchingLoggedUser = async (
    introspectionUser: ZitadelIntrospectionUser
  ): Promise<GetMatchingLoggedUserResult> => {
    const internalUserResult = await oidcWithInternalUserMappingService.findLoggedUserFromProvider(
      EXTERNAL_PROVIDER_NAME,
      introspectionUser.sub
    );

    if (internalUserResult.outcome === "internalUserNotFound") {
      return {
        outcome: "notLogged",
        reason: "internalUserNotFound",
      };
    }

    const internalUserInfo = internalUserResult.user;

    const roleFromToken = getRoleFromLoggedUser(introspectionUser);

    if (!roleFromToken) {
      return {
        outcome: "notLogged",
        reason: "userHasNoRole",
      };
    }

    return {
      outcome: "success",
      user: {
        id: internalUserInfo.id,
        role: roleFromToken,
      },
    };
  };

  return { introspectAccessToken, getRoleFromLoggedUser, getMatchingLoggedUser };
};

export type ZitadelOidcService = ReturnType<typeof buildZitadelOidcService>;
