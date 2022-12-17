import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";

export type CommuneRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildCommuneRepository = ({ slonik }: CommuneRepositoryDependencies) => {
  const getCountByDepartementId = async (departementId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.commune
      WHERE
        commune.departement_id = ${departementId}
    `;

    return slonik.oneFirst(query);
  };

  return {
    getCountByDepartementId,
  };
};

export type CommuneRepository = ReturnType<typeof buildCommuneRepository>;
