import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type UserWithPasswordResult } from "../repositories/user/user-repository-types.js";
import { type UserRepository } from "../repositories/user/user-repository.js";
import { type LoggedUser } from "../types/User.js";
import { OucaError } from "../utils/errors.js";

type UserServiceDependencies = {
  logger: Logger;
  slonik: DatabasePool;
  userRepository: UserRepository;
  settingsRepository: SettingsRepository;
};

export type CreateUserInput = {
  extProvider: string;
  extProviderUserId: string;
};

export const buildUserService = ({ logger, slonik, userRepository, settingsRepository }: UserServiceDependencies) => {
  const getUser = async (userId: string): Promise<UserWithPasswordResult | null> => {
    const user = await userRepository.getUserInfoById(userId);

    if (!user) {
      return null;
    }

    return user;
  };

  const createUser = async (
    { extProvider, extProviderUserId }: CreateUserInput,
    loggedUser: LoggedUser | null
  ): Promise<UserWithPasswordResult> => {
    // Only an administrator can create new accounts
    // Check that the user requesting the account creation is authorized
    if (loggedUser?.role !== "admin") {
      throw new OucaError("OUCA0007");
    }

    const createdUser = await slonik.transaction(async (transactionConnection) => {
      const createdUserQueryResult = await userRepository.createUser(
        {
          ext_provider_name: extProvider,
          ext_provider_id: extProviderUserId,
        },
        transactionConnection
      );

      await settingsRepository.createDefaultSettings(createdUserQueryResult.id, transactionConnection);

      return createdUserQueryResult;
    });

    return createdUser;
  };

  // Not used, not sure if still needed with IDP
  const deleteUser = async (userId: string, loggedUser: LoggedUser): Promise<boolean> => {
    // Only a user can delete itself
    // With admin role, admin can delete anyone
    if (loggedUser.id === userId || loggedUser.role === "admin") {
      const isSuccess = await userRepository.deleteUserById(userId);

      if (isSuccess) {
        logger.info(`User with id ${userId} has been deleted. Request has been initiated by ID ${loggedUser.id}`);
      }

      return isSuccess;
    } else {
      return Promise.reject(new OucaError("OUCA0001"));
    }
  };

  return {
    getUser,
    createUser,
    deleteUser,
  };
};

export type UserService = ReturnType<typeof buildUserService>;
