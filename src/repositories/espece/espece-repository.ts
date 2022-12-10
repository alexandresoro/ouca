import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";

export type EspeceRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildEspeceRepository = ({ slonik }: EspeceRepositoryDependencies) => {
  const getCountByClasseId = async (classeId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.espece
      WHERE
        espece.classe_id = ${classeId}
    `;

    return slonik.oneFirst(query);
  };

  return {
    getCountByClasseId,
  };
};

export type EspeceRepository = ReturnType<typeof buildEspeceRepository>;
