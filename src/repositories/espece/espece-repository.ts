import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";
import { especeSchema, type Espece } from "./espece-repository-types";

export type EspeceRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildEspeceRepository = ({ slonik }: EspeceRepositoryDependencies) => {
  const findEspeceById = async (id: number): Promise<Espece | null> => {
    const query = sql.type(especeSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.espece
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findEspeceByDonneeId = async (donneeId: number | undefined): Promise<Espece | null> => {
    if (!donneeId) {
      return null;
    }

    const query = sql.type(especeSchema)`
      SELECT 
        espece.*
      FROM
        basenaturaliste.espece
      LEFT JOIN basenaturaliste.donnee ON espece.id = donnee.espece_id
      WHERE
      donnee.id = ${donneeId}
    `;

    return slonik.maybeOne(query);
  };

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
    findEspeceById,
    findEspeceByDonneeId,
    getCountByClasseId,
  };
};

export type EspeceRepository = ReturnType<typeof buildEspeceRepository>;
