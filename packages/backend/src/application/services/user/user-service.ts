import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { CreateUserInput, User } from "@domain/user/user.js";
import type { UserRepository } from "@interfaces/user-repository-interface.js";
import { type Result, err, ok } from "neverthrow";
import { logger } from "../../../utils/logger.js";

type UserServiceDependencies = {
  userRepository: UserRepository;
};

export const buildUserService = ({ userRepository }: UserServiceDependencies) => {
  const getUser = async (userId: string): Promise<User | null> => userRepository.getUserInfoById(userId);

  /**
   * Compared to the more generic `findUserByExternalId` this function
   * is more suitable to only find the user id which is expected to remain constant
   * and not change over time for a given external user id/provider.
   * This method leverages a cache to avoid querying the database for every request and
   * so it is preferred to use this method over `findUserByExternalId` when only the user id is needed.
   */
  const findUserIdByExternalIdWithCache = async (
    externalProviderName: string,
    externalUserId: string,
  ): Promise<string | null> => userRepository.findUserIdByExternalIdWithCache({ externalUserId, externalProviderName });

  const findUserByExternalId = async (externalProviderName: string, externalUserId: string): Promise<User | null> =>
    userRepository.findUserByExternalId({ externalUserId, externalProviderName });

  const updateSettings = async (id: string, settings: User["settings"]): Promise<User> =>
    userRepository.updateUserSettings(id, settings);

  const createUser = async ({ extProvider, extProviderUserId }: CreateUserInput): Promise<User> =>
    userRepository.createUser({
      extProviderName: extProvider,
      extProviderId: extProviderUserId,
    });

  // Not used, not sure if still needed with IDP
  const deleteUser = async (userId: string, loggedUser: LoggedUser): Promise<Result<boolean, AccessFailureReason>> => {
    if (loggedUser.id !== userId && loggedUser.role !== "admin") {
      // Only a user can delete itself
      // With admin role, admin can delete anyone
      return err("notAllowed");
    }

    const isSuccess = await userRepository.deleteUserById(userId);

    if (isSuccess) {
      logger.info(`User with id ${userId} has been deleted. Request has been initiated by ID ${loggedUser.id}`);
    }

    return ok(isSuccess);
  };

  return {
    getUser,
    findUserIdByExternalIdWithCache,
    findUserByExternalId,
    updateSettings,
    createUser,
    deleteUser,
  };
};

export type UserService = ReturnType<typeof buildUserService>;
