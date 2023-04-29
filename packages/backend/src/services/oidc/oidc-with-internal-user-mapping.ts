import { type Redis } from "ioredis";
import { type Logger } from "pino";
import { type UserWithPasswordResult } from "../../repositories/user/user-repository-types.js";
import { type UserRepository } from "../../repositories/user/user-repository.js";

const EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_PREFIX = "externalUserInternalUserMapping";
const EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_DURATION = 600; // 10mns

export type OidcWithInternalUserMappingServiceDependencies = {
  logger: Logger;
  redis: Redis;
  userRepository: UserRepository;
};

type FindLoggedUserFromProviderResult =
  | {
      outcome: "internalUserNotFound";
    }
  | {
      outcome: "found";
      user: UserWithPasswordResult;
    };

export const buildOidcWithInternalUserMappingService = ({
  logger,
  redis,
  userRepository,
}: OidcWithInternalUserMappingServiceDependencies) => {
  const findLoggedUserFromProvider = async (
    externalProviderName: string,
    externalUserId: string
  ): Promise<FindLoggedUserFromProviderResult> => {
    // Check if we don't already have the user info in redis cache
    const userCacheKey = `${EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_PREFIX}:${externalProviderName}:${externalUserId}`;
    const cachedUserStr = await redis.get(userCacheKey);

    let matchingUser: UserWithPasswordResult | null;
    if (cachedUserStr) {
      matchingUser = JSON.parse(cachedUserStr) as UserWithPasswordResult | null;
    } else {
      matchingUser = await userRepository.findUserByExternalId(externalProviderName, externalUserId);
      // Store in cache the result if it exists to avoid calling the database for every request
      // Regardless of the outcome, store the result in cache

      if (matchingUser) {
        await redis
          .set(userCacheKey, JSON.stringify(matchingUser), "EX", EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_DURATION)
          .catch(() => {
            logger.warn(
              {
                matchingUser,
              },
              "Storing internal user mapping has failed."
            );
          });
      }
    }

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
