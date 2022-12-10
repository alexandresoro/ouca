import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";

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

  const getCountByClasseId = async (classeId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      LEFT JOIN
        basenaturaliste.espece ON donnee.espece_id = espece.id
      WHERE
        espece.classe_id = ${classeId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountByObservateurId = async (observateurId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      LEFT JOIN
        basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
      WHERE
        inventaire.observateur_id = ${observateurId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountBySexeId = async (sexeId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      WHERE
        sexe_id = ${sexeId}
    `;

    return slonik.oneFirst(query);
  };

  return {
    getCountByAgeId,
    getCountByClasseId,
    getCountByObservateurId,
    getCountBySexeId,
  };
};

export type DonneeRepository = ReturnType<typeof buildDonneeRepository>;
