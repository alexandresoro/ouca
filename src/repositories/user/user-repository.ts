import { sql, type DatabasePool } from "slonik";
import { z } from "zod";
import { type DatabaseRole } from "../../types/User";
import { objectToKeyValueInsert, objectToKeyValueSet } from "../../utils/slonik-utils";
import { userWithPasswordSchema, type UserWithPasswordResult } from "./user-repository-types";

export type UserRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildUserRepository = ({ slonik }: UserRepositoryDependencies) => {
  const getUserInfoById = async (userId: string): Promise<UserWithPasswordResult | null> => {
    const query = sql.type(userWithPasswordSchema)`
    SELECT 
      *
    FROM
      basenaturaliste.user
    WHERE
      id = ${userId}
  `;

    return slonik.maybeOne(query);
  };

  const findUserByUsername = async (username: string): Promise<UserWithPasswordResult | null> => {
    const query = sql.type(userWithPasswordSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.user
      WHERE
        username = ${username}
    `;

    return slonik.maybeOne(query);
  };

  const getAdminsCount = async (): Promise<number> => {
    const query = sql.type(z.object({ count: z.number() }))`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.user
      WHERE
        role = 'admin'
    `;

    return slonik.oneFirst(query);
  };

  const createUser = async (create: {
    first_name: string;
    last_name?: string | undefined | null;
    username: string;
    password: string;
    role: DatabaseRole;
  }): Promise<UserWithPasswordResult> => {
    const userCreationTransactionResult = await slonik.transaction(async (transactionConnection) => {
      // Create the user
      const createUserQuery = sql.type(userWithPasswordSchema)`
        INSERT INTO
          basenaturaliste.user
          ${objectToKeyValueInsert(create)}
        RETURNING
          *
      `;
      const createUserQueryResult = await transactionConnection.one(createUserQuery);

      // Create its default settings
      const createSettingsQuery = sql.type(z.void())`
        INSERT INTO
          basenaturaliste.settings
          (user_id)
        VALUES
          (${createUserQueryResult.id})
      `;
      await transactionConnection.query(createSettingsQuery);

      return createUserQueryResult;
    });

    return userCreationTransactionResult;
  };

  const updateUser = async (
    userId: string,
    update: {
      first_name: string | undefined;
      last_name: string | undefined;
      username: string | undefined;
      password: string | undefined;
    }
  ): Promise<UserWithPasswordResult> => {
    const query = sql.type(userWithPasswordSchema)`
      UPDATE
        basenaturaliste.user
      SET
        ${objectToKeyValueSet(update)}
      WHERE
        id = ${userId}
      RETURNING
        *
    `;

    return slonik.one(query);
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
    findUserByUsername,
    getAdminsCount,
    createUser,
    updateUser,
    deleteUserById,
  };
};

export type UserRepository = ReturnType<typeof buildUserRepository>;
