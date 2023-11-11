import { userSchema, type User } from "@domain/user/user.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import { sql, type DatabasePool, type DatabaseTransactionConnection } from "slonik";
import { z } from "zod";
import { objectToKeyValueInsert } from "../../../repositories/repository-helpers.js";
import { logger } from "../../../utils/logger.js";

const EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_PREFIX = "externalUserInternalUserMapping";
const EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_DURATION = 600; // 10mns

const getCachedMappedUser = async ({
  externalProviderName,
  externalUserId,
}: {
  externalProviderName: string;
  externalUserId: string;
}): Promise<User | null> => {
  // Try first to retrieve from cache to avoid querying the DB if possible
  const userCacheKey = `${EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_PREFIX}:${externalProviderName}:${externalUserId}`;

  const cachedUserStr = await redis.get(userCacheKey);

  return cachedUserStr ? (JSON.parse(cachedUserStr) as User) : null;
};

const storeMappedUserToCache = async (user: User): Promise<void> => {
  const userCacheKey = `${EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_PREFIX}:${user.extProviderName}:${user.extProviderId}`;

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
};

export const buildUserRepository = ({ slonik }: { slonik: DatabasePool }) => {
  const getUserInfoById = async (userId: string): Promise<User | null> => {
    const query = sql.type(userSchema)`
    SELECT 
      *
    FROM
      basenaturaliste.user
    WHERE
      id = ${userId}
  `;

    return slonik.maybeOne(query);
  };

  const findUserByExternalIdFromStorage = ({
    externalProviderName,
    externalProviderId,
  }: { externalProviderName: string; externalProviderId: string }): Promise<User | null> => {
    const query = sql.type(userSchema)`
    SELECT 
      *
    FROM
      basenaturaliste.user
    WHERE
      ext_provider_name = ${externalProviderName}
      AND ext_provider_id = ${externalProviderId}
  `;

    return slonik.maybeOne(query);
  };

  const findUserByExternalId = async ({
    externalProviderName,
    externalUserId,
  }: { externalProviderName: string; externalUserId: string }): Promise<User | null> => {
    // Try first to retrieve from cache to avoid querying the DB if possible
    const cachedUser = await getCachedMappedUser({ externalProviderName, externalUserId });

    if (cachedUser) {
      // Use the cached structure
      return cachedUser;
    }

    const user = await findUserByExternalIdFromStorage({ externalProviderName, externalProviderId: externalUserId });

    // Store in cache the result if it exists to avoid calling the database for every request
    if (user) {
      await storeMappedUserToCache(user);
    }

    return user;
  };

  const createUser = async (
    create: {
      ext_provider_name: string;
      ext_provider_id: string;
    },
    transaction?: DatabaseTransactionConnection
  ): Promise<User> => {
    const createUserQuery = sql.type(userSchema)`
      INSERT INTO
        basenaturaliste.user
        ${objectToKeyValueInsert(create)}
      RETURNING
        *
    `;

    return (transaction ?? slonik).one(createUserQuery);
  };

  const deleteUserById = async (userId: string): Promise<boolean> => {
    const query = sql.type(z.void())`
      DELETE
      FROM
        basenaturaliste.user
      WHERE
        id = ${userId}
    `;

    const result = await slonik.query(query);

    return result?.rowCount === 1;
  };

  return { getUserInfoById, findUserByExternalId, createUser, deleteUserById };
};
