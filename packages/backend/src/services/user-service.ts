import { type Redis } from "ioredis";
import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import { type SettingsRepository } from "../repositories/settings/settings-repository.js";
import { type UserResult } from "../repositories/user/user-repository-types.js";
import { type UserRepository } from "../repositories/user/user-repository.js";
import { type LoggedUser } from "../types/User.js";
import { OucaError } from "../utils/errors.js";

const EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_PREFIX = "externalUserInternalUserMapping";
const EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_DURATION = 600; // 10mns

type UserServiceDependencies = {
  logger: Logger;
  slonik: DatabasePool;
  redis: Redis;
  userRepository: UserRepository;
  settingsRepository: SettingsRepository;
};

export type CreateUserInput = {
  extProvider: string;
  extProviderUserId: string;
};

export const buildUserService = ({
  logger,
  slonik,
  redis,
  userRepository,
  settingsRepository,
}: UserServiceDependencies) => {
  const getUser = async (userId: string): Promise<UserResult | null> => {
    return await userRepository.getUserInfoById(userId);
  };

  const findUserByExternalId = async (
    externalProviderName: string,
    externalUserId: string
  ): Promise<UserResult | null> => {
    // Try first to retrieve from cache to avoid querying the DB if possible
    const userCacheKey = `${EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_PREFIX}:${externalProviderName}:${externalUserId}`;
    const cachedUserStr = await redis.get(userCacheKey);

    if (cachedUserStr) {
      // Use the cached structure
      return JSON.parse(cachedUserStr) as UserResult;
    } else {
      const user = await userRepository.findUserByExternalId(externalProviderName, externalUserId);

      // Store in cache the result if it exists to avoid calling the database for every request
      if (user) {
        await redis
          .set(userCacheKey, JSON.stringify(user), "EX", EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_DURATION)
          .catch(() => {
            logger.warn(
              {
                user,
              },
              "Storing internal user mapping has failed."
            );
          });
      }

      return user;
    }
  };

  const createUser = async (
    { extProvider, extProviderUserId }: CreateUserInput,
    loggedUser: LoggedUser | null
  ): Promise<UserResult> => {
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
    findUserByExternalId,
    createUser,
    deleteUser,
  };
};

export type UserService = ReturnType<typeof buildUserService>;
