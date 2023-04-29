import { z } from "zod";
import { type UserWithPasswordResult } from "../../repositories/user/user-repository-types.js";
import introspectAccessTokenCommon from "./introspect-access-token.js";
import { type OidcWithInternalUserMappingService } from "./oidc-with-internal-user-mapping.js";

const EXTERNAL_PROVIDER_NAME = "zitadel";

export const introspectionUser = z.object({
  sub: z.string(),
  iss: z.string(),
  username: z.string(),
  exp: z.number(), // Expiration date as unix time
  email: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  name: z.string().optional(),
  "urn:zitadel:iam:org:project:roles": z.object({}),
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
  oidcWithInternalUserMappingService: OidcWithInternalUserMappingService;
};

type GetMatchingLoggedUserResult =
  | {
      outcome: "internalUserNotFound";
    }
  | {
      outcome: "success";
      user: UserWithPasswordResult;
    };

export const buildZitadelOidcService = ({ oidcWithInternalUserMappingService }: ZitadelOidcServiceDependencies) => {
  const introspectAccessToken = async (accessToken: string): Promise<ZitadelIntrospectionResult> => {
    return introspectAccessTokenCommon(accessToken, introspectionResultSchema);
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
        outcome: "internalUserNotFound",
      };
    }

    const internalUserInfo = internalUserResult.user;

    return {
      outcome: "success",
      user: {
        ...internalUserInfo,
      },
    };
  };

  return { introspectAccessToken, getMatchingLoggedUser };
};

export type ZitadelOidcService = ReturnType<typeof buildZitadelOidcService>;
