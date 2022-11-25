import { sql, type DatabasePool } from "slonik";
import { findByUserNameSchema, type FindByUserNameResult } from "./user-repository-types";

export type UserRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildUserRepository = ({ slonik }: UserRepositoryDependencies) => {
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

  return {
    findUserByUsername,
  };
};
