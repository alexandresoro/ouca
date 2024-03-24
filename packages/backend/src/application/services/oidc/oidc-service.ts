import type { OIDCIntrospectionResult } from "@domain/oidc/oidc-introspection.js";
import type { OIDCUser } from "@domain/oidc/oidc-user.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { type UserRole, userRoles } from "@domain/user/user-role.js";
import type { User } from "@domain/user/user.js";
import { introspectAccessToken as introspectAccessTokenRepository } from "@infrastructure/oidc/oidc-introspect-access-token.js";
import { type Result, err, ok } from "neverthrow";
import type { UserService } from "../user/user-service.js";

type OidcServiceDependencies = {
  userService: UserService;
};

export const buildOidcService = ({ userService }: OidcServiceDependencies) => {
  const findLoggedUserFromProvider = async (
    externalProviderName: string,
    externalUserId: string,
  ): Promise<Result<User, "internalUserNotFound">> => {
    const matchingUser = await userService.findUserByExternalId(externalProviderName, externalUserId);

    if (!matchingUser) {
      return err("internalUserNotFound");
    }

    return ok(matchingUser);
  };

  const introspectAccessToken = async (
    accessToken: string,
  ): Promise<Result<OIDCIntrospectionResult, "introspectionError">> => {
    return (await introspectAccessTokenRepository(accessToken)).mapErr(() => "introspectionError");
  };

  const getHighestRoleFromLoggedUser = (oidcUser: OIDCUser): UserRole | null => {
    return (
      userRoles.find((existingRole) => {
        return oidcUser.roles.includes(existingRole);
      }) ?? null
    );
  };

  const getMatchingLoggedUser = async (
    oidcUser: OIDCUser,
  ): Promise<Result<LoggedUser, "internalUserNotFound" | "userHasNoRole">> => {
    // Validate role from token
    const roleFromToken = getHighestRoleFromLoggedUser(oidcUser);

    if (!roleFromToken) {
      return err("userHasNoRole");
    }

    // Validate internal matching user
    const internalUserResult = await findLoggedUserFromProvider(oidcUser.oidcProvider, oidcUser.sub);

    if (internalUserResult.isErr()) {
      return err(internalUserResult.error);
    }

    const internalUserInfo = internalUserResult.value;

    return ok({
      id: internalUserInfo.id,
      role: roleFromToken,
    });
  };

  return { introspectAccessToken, getHighestRoleFromLoggedUser, getMatchingLoggedUser };
};

export type OidcService = ReturnType<typeof buildOidcService>;
