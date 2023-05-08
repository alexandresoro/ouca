import { sql, type DatabasePool, type DatabaseTransactionConnection } from "slonik";
import { z } from "zod";
import { objectToKeyValueInsert } from "../repository-helpers.js";
import { userSchema, type UserResult } from "./user-repository-types.js";

export type UserRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildUserRepository = ({ slonik }: UserRepositoryDependencies) => {
  const getUserInfoById = async (userId: string): Promise<UserResult | null> => {
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

  const findUserByExternalId = async (
    externalProviderName: string,
    externalProviderId: string
  ): Promise<UserResult | null> => {
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

  const createUser = async (
    create: {
      ext_provider_name: string;
      ext_provider_id: string;
    },
    transaction?: DatabaseTransactionConnection
  ): Promise<UserResult> => {
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

  return {
    getUserInfoById,
    findUserByExternalId,
    createUser,
    deleteUserById,
  };
};

export type UserRepository = ReturnType<typeof buildUserRepository>;
