import { OucaError } from "@domain/errors/ouca-error.js";
import { type LoggedUser } from "@domain/user/logged-user.js";
import { type User } from "@domain/user/user.js";
import { type UserRepository } from "@interfaces/user-repository-interface.js";
import { logger } from "../../../utils/logger.js";

type UserServiceDependencies = {
  userRepository: UserRepository;
};

export type CreateUserInput = {
  extProvider: string;
  extProviderUserId: string;
};

export const buildUserService = ({ userRepository }: UserServiceDependencies) => {
  const getUser = async (userId: string): Promise<User | null> => userRepository.getUserInfoById(userId);

  const findUserByExternalId = async (externalProviderName: string, externalUserId: string): Promise<User | null> =>
    userRepository.findUserByExternalId({ externalUserId, externalProviderName });

  const createUser = async ({ extProvider, extProviderUserId }: CreateUserInput): Promise<User> =>
    userRepository.createUser({
      extProviderName: extProvider,
      extProviderId: extProviderUserId,
    });

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
    findUserByExternalId,
    createUser,
    deleteUser,
  };
};

export type UserService = ReturnType<typeof buildUserService>;
