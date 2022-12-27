import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";
import { idSchema, maxRegoupementSchema } from "./donnee-repository-types";

export type DonneeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildDonneeRepository = ({ slonik }: DonneeRepositoryDependencies) => {
  const findLatestDonneeId = async (): Promise<number | null> => {
    const query = sql.type(idSchema)`
      SELECT
        id
      FROM 
        basenaturaliste.donnee
      WHERE date_creation = (
          SELECT MAX (date_creation)
          FROM basenaturaliste.donnee
       )
    `;

    return slonik.oneFirst(query);
  };

  const findLatestRegroupement = async (): Promise<number | null> => {
    const query = sql.type(maxRegoupementSchema)`
      SELECT 
        MAX(regroupement) 
      FROM 
        basenaturaliste.donnee
    `;

    return slonik.oneFirst(query);
  };

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

  const getCountByCommuneId = async (communeId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      LEFT JOIN
        basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
      LEFT JOIN
        basenaturaliste.lieudit ON inventaire.lieudit_id = lieudit.id
      WHERE
      lieudit.commune_id = ${communeId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountByComportementId = async (comportementId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee_comportement
      WHERE
        comportement_id = ${comportementId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountByDepartementId = async (departementId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      LEFT JOIN
        basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
      LEFT JOIN
        basenaturaliste.lieudit ON inventaire.lieudit_id = lieudit.id
      LEFT JOIN
        basenaturaliste.commune ON lieudit.commune_id = commune.id
      WHERE
        commune.departement_id = ${departementId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountByEspeceId = async (especeId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      WHERE
        donnee.espece_id = ${especeId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountByEstimationDistanceId = async (estimationDistanceId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      WHERE
        estimation_distance_id = ${estimationDistanceId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountByEstimationNombreId = async (estimationNombreId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      WHERE
        estimation_nombre_id = ${estimationNombreId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountByLieuditId = async (lieuditId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      LEFT JOIN
        basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
      WHERE
        inventaire.lieudit_id = ${lieuditId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountByMeteoId = async (meteoId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      LEFT JOIN
        basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
      LEFT JOIN
        basenaturaliste.inventaire_meteo ON inventaire.id = inventaire_meteo.inventaire_id
      WHERE
        inventaire_meteo.meteo_id = ${meteoId}
    `;

    return slonik.oneFirst(query);
  };

  const getCountByMilieuId = async (milieuId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee_milieu
      WHERE
        milieu_id = ${milieuId}
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
    findLatestDonneeId,
    findLatestRegroupement,
    getCountByAgeId,
    getCountByClasseId,
    getCountByCommuneId,
    getCountByComportementId,
    getCountByDepartementId,
    getCountByEspeceId,
    getCountByEstimationDistanceId,
    getCountByEstimationNombreId,
    getCountByLieuditId,
    getCountByMeteoId,
    getCountByMilieuId,
    getCountByObservateurId,
    getCountBySexeId,
  };
};

export type DonneeRepository = ReturnType<typeof buildDonneeRepository>;
