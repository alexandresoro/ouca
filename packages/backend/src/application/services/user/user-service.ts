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
    findUserByExternalId,
    updateSettings,
    createUser,
    deleteUser,
  };
};

export type UserService = ReturnType<typeof buildUserService>;
