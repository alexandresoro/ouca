import { type UserResult } from "../../repositories/user/user-repository-types.js";
import { type UserService } from "../user-service.js";

export type OidcWithInternalUserMappingServiceDependencies = {
  userService: UserService;
};

type FindLoggedUserFromProviderResult =
  | {
      outcome: "internalUserNotFound";
    }
  | {
      outcome: "found";
      user: UserResult;
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
