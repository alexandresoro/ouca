import { type User } from "@domain/user/user.js";
import { type UserService } from "../../application/services/user/user-service.js";

export type OidcWithInternalUserMappingServiceDependencies = {
  userService: UserService;
};

type FindLoggedUserFromProviderResult =
  | {
      outcome: "internalUserNotFound";
    }
  | {
      outcome: "found";
      user: User;
    };

export const buildOidcWithInternalUserMappingService = ({
  userService,
}: OidcWithInternalUserMappingServiceDependencies) => {
  const findLoggedUserFromProvider = async (
    externalProviderName: string,
    externalUserId: string
  ): Promise<FindLoggedUserFromProviderResult> => {
    const matchingUser = await userService.findUserByExternalId(externalProviderName, externalUserId);

    if (!matchingUser) {
      return {
        outcome: "internalUserNotFound",
      };
    }

    return {
      outcome: "found",
      user: matchingUser,
    };
  };

  return { findLoggedUserFromProvider };
};

export type OidcWithInternalUserMappingService = ReturnType<typeof buildOidcWithInternalUserMappingService>;
