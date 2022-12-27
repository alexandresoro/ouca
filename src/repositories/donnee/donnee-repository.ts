import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";
import { buildPaginationFragment, buildSortOrderFragment } from "../repository-helpers";
import { buildOrderByIdentifier } from "./donnee-repository-helper";
import {
  donneeSchema,
  idSchema,
  maxRegoupementSchema,
  type Donnee,
  type DonneeFindManyInput,
} from "./donnee-repository-types";

export type DonneeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildDonneeRepository = ({ slonik }: DonneeRepositoryDependencies) => {
  const findDonnees = async ({ orderBy, sortOrder, searchCriteria, offset, limit }: DonneeFindManyInput = {}): Promise<
    readonly Donnee[]
  > => {
    // TODO handle search criteria
    const query = sql.type(donneeSchema)`
      SELECT
        donnee.*
      FROM basenaturaliste.donnee
      LEFT JOIN basenaturaliste.espece ON donnee.espece_id = espece.id
      LEFT JOIN basenaturaliste.donnee_comportement ON donnee.id = donnee_comportement.donnee_id
      LEFT JOIN basenaturaliste.comportement ON donnee_comportement.comportement_id = comportement.id
      LEFT JOIN basenaturaliste.donnee_milieu ON donnee.id = donnee_milieu.donnee_id
      LEFT JOIN basenaturaliste.milieu ON donnee_milieu.milieu_id = milieu.id
      LEFT JOIN basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
      LEFT JOIN basenaturaliste.lieudit ON inventaire.lieudit_id = lieudit.id
      LEFT JOIN basenaturaliste.commune ON lieudit.commune_id = commune.id
      LEFT JOIN basenaturaliste.inventaire_meteo ON inventaire.id = inventaire_meteo.inventaire_id
      LEFT JOIN basenaturaliste.inventaire_associe ON inventaire.id = inventaire_associe.inventaire_id
      ${
        orderBy === "age"
          ? sql.fragment`
        LEFT JOIN basenaturaliste.age ON donnee.age_id = age.id`
          : sql.fragment``
      }
      ${
        orderBy === "sexe"
          ? sql.fragment`
        LEFT JOIN basenaturaliste.sexe ON donnee.sexe_id = sexe.id`
          : sql.fragment``
      }
      ${
        orderBy === "departement"
          ? sql.fragment`
        LEFT JOIN basenaturaliste.departement ON commune.departement_id = departement.id`
          : sql.fragment``
      }
      ${
        orderBy === "observateur"
          ? sql.fragment`
        LEFT JOIN basenaturaliste.observateur ON inventaire.observateur_id = observateur.id`
          : sql.fragment``
      }
      GROUP BY donnee.id${
        orderBy
          ? sql.fragment`
      ,${buildOrderByIdentifier(orderBy)}`
          : sql.fragment``
      }
      ${
        orderBy
          ? sql.fragment`
      ORDER BY ${buildOrderByIdentifier(orderBy)}`
          : sql.fragment``
      }${buildSortOrderFragment({
      orderBy,
      sortOrder,
    })}
      ${buildPaginationFragment({ offset, limit })}
    `;

    return slonik.any(query);
  };

  const getCount = async (searchCriteria: DonneeFindManyInput["searchCriteria"] = {}): Promise<number> => {
    // TODO handle search criteria
    const query = sql.type(countSchema)`
      SELECT
        COUNT(DISTINCT donnee.id)
      FROM basenaturaliste.donnee
      LEFT JOIN basenaturaliste.espece ON donnee.espece_id = espece.id
      LEFT JOIN basenaturaliste.donnee_comportement ON donnee.id = donnee_comportement.donnee_id
      LEFT JOIN basenaturaliste.comportement ON donnee_comportement.comportement_id = comportement.id
      LEFT JOIN basenaturaliste.donnee_milieu ON donnee.id = donnee_milieu.donnee_id
      LEFT JOIN basenaturaliste.milieu ON donnee_milieu.milieu_id = milieu.id
      LEFT JOIN basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
      LEFT JOIN basenaturaliste.lieudit ON inventaire.lieudit_id = lieudit.id
      LEFT JOIN basenaturaliste.commune ON lieudit.commune_id = commune.id
      LEFT JOIN basenaturaliste.inventaire_meteo ON inventaire.id = inventaire_meteo.inventaire_id
      LEFT JOIN basenaturaliste.inventaire_associe ON inventaire.id = inventaire_associe.inventaire_id
    `;

    return slonik.oneFirst(query);
  };

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
    findDonnees,
    getCount,
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
