import { sql, type DatabasePool } from "slonik";
import { z } from "zod";
import { findByUserNameSchema, type FindByUserNameResult, type UserInfo } from "./user-repository-types";

export type UserRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildUserRepository = ({ slonik }: UserRepositoryDependencies) => {
  const getUserInfoById = async (userId: string): Promise<UserInfo | null> => {
    const query = sql.type(findByUserNameSchema)`
    SELECT 
      *
    FROM
      basenaturaliste.user
    WHERE
      id = ${userId}
  `;

    return slonik.maybeOne(query);
  };

  const findUserByUsername = async (username: string): Promise<FindByUserNameResult | null> => {
    const query = sql.type(findByUserNameSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.user
      WHERE
        username = ${username}
    `;

    return slonik.maybeOne(query);
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

    return result?.rowCount > 0;
  };

  return {
    getUserInfoById,
    findUserByUsername,
    deleteUserById,
  };
};

export type UserRepository = ReturnType<typeof buildUserRepository>;
