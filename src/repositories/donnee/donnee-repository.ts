import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../repository-helpers";

export type DonneeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildDonneeRepository = ({ slonik }: DonneeRepositoryDependencies) => {
  const getCountByAgeId = async (ageId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      WHERE
        age_id = ${ageId}
    `;

    return slonik.oneFirst(query);
  };

  return {
    getCountByAgeId,
  };
};

export type DonneeRepository = ReturnType<typeof buildDonneeRepository>;
