import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";

export type LieuditRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildLieuditRepository = ({ slonik }: LieuditRepositoryDependencies) => {
  const getCountByCommuneId = async (communeId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.lieudit
      WHERE
        lieudit.commune_id = ${communeId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountByDepartementId = async (departementId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.lieudit
      LEFT JOIN
        basenaturaliste.commune ON lieudit.commune_id = commune.id
      WHERE
        commune.departement_id = ${departementId}
    `;

    return slonik.oneFirst(query);
  };

  return {
    getCountByCommuneId,
    getCountByDepartementId,
  };
};

export type LieuditRepository = ReturnType<typeof buildLieuditRepository>;
