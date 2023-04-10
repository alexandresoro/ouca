import { sql, type DatabasePool, type DatabaseTransactionConnection, type QueryResult } from "slonik";
import { z } from "zod";
import { countSchema } from "../common.js";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectToKeyValueInsert,
  objectToKeyValueSet,
} from "../repository-helpers.js";
import {
  buildFindMatchingDonneeClause,
  buildOrderByIdentifier,
  buildSearchCriteriaClause,
} from "./donnee-repository-helper.js";
import {
  donneeSchema,
  idSchema,
  maxRegoupementSchema,
  type Donnee,
  type DonneeCreateInput,
  type DonneeFindManyInput,
  type DonneeFindMatchingInput,
} from "./donnee-repository-types.js";

export type DonneeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildDonneeRepository = ({ slonik }: DonneeRepositoryDependencies) => {
  const findDonneeById = async (id: number): Promise<Donnee | null> => {
    const query = sql.type(donneeSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.donnee
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findDonnees = async ({
    orderBy,
    sortOrder,
    searchCriteria,
    offset,
    limit,
  }: DonneeFindManyInput = {}): Promise<readonly Donnee[]> => {
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
      ${buildSearchCriteriaClause(searchCriteria)}
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
          : sql.fragment`ORDER BY donnee.id DESC`
      }${buildSortOrderFragment({
        orderBy,
        sortOrder,
      })}
      ${buildPaginationFragment({ offset, limit })}
    `;

    return slonik.any(query);
  };

  const findExistingDonnee = async (criteria: DonneeFindMatchingInput): Promise<Donnee | null> => {
    const { comportementsIds, milieuxIds } = criteria;

    // TODO the match is a bit too wide, meaning that a missing/null criteria will have no
    // associated where clause, but we can consider this as acceptable
    const query = sql.type(donneeSchema)`
      SELECT
        donnee.*
      FROM
        basenaturaliste.donnee
      LEFT JOIN
	      basenaturaliste.donnee_comportement ON donnee_comportement.donnee_id = donnee.id
      LEFT JOIN
	      basenaturaliste.donnee_milieu ON donnee_milieu.donnee_id = donnee.id
      ${buildFindMatchingDonneeClause(criteria)}
      GROUP BY donnee.id
      HAVING 
        COUNT(DISTINCT donnee_comportement.comportement_id) = ${comportementsIds?.length ?? 0}
        AND COUNT(DISTINCT donnee_milieu.milieu_id) = ${milieuxIds?.length ?? 0}
      LIMIT 1
    `;

    return slonik.maybeOne(query);
  };

  const findPreviousDonneeId = async (id: number): Promise<number | null> => {
    return await slonik.transaction(async (transaction) => {
      const currentInventaire = sql.type(
        z.object({
          id: z.number(),
          date: z.string(),
          heure: z.string().optional(),
        })
      )`
        SELECT
	        id,
          date, 
          heure
        FROM
	        basenaturaliste.inventaire
        WHERE
          id = (
            SELECT
              inventaire_id
            FROM
              basenaturaliste.donnee
            WHERE
              id = ${id} 
          )
      `;

      const { date, heure } = await transaction.one(currentInventaire);

      const previousDonneeQuery = sql.type(z.object({ id: z.number() }))`
        SELECT
	        donnee.id
        FROM
	        basenaturaliste.donnee
        LEFT JOIN basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
        WHERE
          (
            inventaire."date" < ${date}
            ${
              heure
                ? sql.fragment`
              OR (
                inventaire."date" = ${date}
                AND inventaire."heure" < ${heure}
              )
              OR (
                inventaire."date" = ${date}
                AND inventaire."heure" = ${heure}
                AND donnee.id < ${id}
              )
            `
                : sql.fragment``
            }
          )
          AND donnee.id != ${id}
        ORDER BY inventaire.date DESC, inventaire.heure DESC NULLS LAST, donnee.date_creation DESC, donnee.id DESC
        LIMIT 1
      `;

      return slonik.maybeOneFirst(previousDonneeQuery);
    });
  };

  const findNextDonneeId = async (id: number): Promise<number | null> => {
    return await slonik.transaction(async (transaction) => {
      const currentInventaire = sql.type(
        z.object({
          id: z.number(),
          date: z.string(),
          heure: z.string().optional(),
        })
      )`
        SELECT
	        id,
          date, 
          heure
        FROM
	        basenaturaliste.inventaire
        WHERE
          id = (
            SELECT
              inventaire_id
            FROM
              basenaturaliste.donnee
            WHERE
              id = ${id} 
          )
      `;

      const { date, heure } = await transaction.one(currentInventaire);

      const nextDonneeQuery = sql.type(z.object({ id: z.number() }))`
        SELECT
	        donnee.id
        FROM
	        basenaturaliste.donnee
        LEFT JOIN basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
        WHERE
          (
            inventaire."date" > ${date}
            ${
              heure
                ? sql.fragment`
              OR (
                inventaire."date" = ${date}
                AND inventaire.heure > ${heure}
              )
              OR (
                inventaire."date" = ${date}
                AND inventaire.heure = ${heure}
                AND donnee.id > ${id}        
              )
            
            `
                : sql.fragment`
              OR (
                inventaire."date" = ${date}
                AND inventaire.heure IS NOT NULL
              )
              OR (
                inventaire."date" = ${date}
                AND inventaire.heure IS NULL
                AND donnee.id > ${id}        
              )
            `
            }
          )
          AND donnee.id != ${id}
        ORDER BY inventaire.date ASC, inventaire.heure ASC NULLS FIRST, donnee.date_creation ASC, donnee.id ASC
        LIMIT 1
      `;

      return slonik.maybeOneFirst(nextDonneeQuery);
    });
  };

  const findDonneeIndex = async (id: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      WHERE
        id <= ${id}
    `;

    return slonik.oneFirst(query);
  };

  const getCount = async (searchCriteria: DonneeFindManyInput["searchCriteria"] = {}): Promise<number> => {
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
      ${buildSearchCriteriaClause(searchCriteria)}
    `;

    return slonik.oneFirst(query);
  };

  const findLatestDonneeId = async (): Promise<number | null> => {
    const query = sql.type(idSchema)`
      SELECT
	      id
      FROM
	      basenaturaliste.donnee
      WHERE
	      donnee.inventaire_id = (
		      SELECT
			      inventaire.id
		      FROM
			      basenaturaliste.inventaire
		      ORDER BY date DESC, heure DESC NULLS LAST
		      LIMIT 1
        )
      ORDER BY date_creation DESC
      LIMIT 1
    `;

    return slonik.maybeOneFirst(query);
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

  const getCountByInventaireId = async (
    inventaireId: number,
    transaction?: DatabaseTransactionConnection
  ): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.donnee
      WHERE
        donnee.inventaire_id = ${inventaireId}
    `;

    return (transaction ?? slonik).oneFirst(query);
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

  const createDonnee = async (
    donneeInput: DonneeCreateInput,
    transaction?: DatabaseTransactionConnection
  ): Promise<Donnee> => {
    const query = sql.type(donneeSchema)`
      INSERT INTO
        basenaturaliste.donnee
        ${objectToKeyValueInsert({ ...donneeInput, date_creation: "NOW()" })}
      RETURNING
        *
    `;

    return (transaction ?? slonik).one(query);
  };

  const updateDonnee = async (
    donneeId: number,
    donneeInput: DonneeCreateInput,
    transaction?: DatabaseTransactionConnection
  ): Promise<Donnee> => {
    const query = sql.type(donneeSchema)`
      UPDATE
        basenaturaliste.donnee
      SET
        ${objectToKeyValueSet(donneeInput)}
      WHERE
        id = ${donneeId}
      RETURNING
        *
    `;

    return (transaction ?? slonik).one(query);
  };

  const deleteDonneeById = async (donneeId: number, transaction?: DatabaseTransactionConnection): Promise<Donnee> => {
    const query = sql.type(donneeSchema)`
      DELETE
      FROM
        basenaturaliste.donnee
      WHERE
        id = ${donneeId}
      RETURNING
        *
    `;

    return (transaction ?? slonik).one(query);
  };

  const updateAssociatedInventaire = async (
    currentInventaireId: number,
    newInventaireId: number,
    transaction?: DatabaseTransactionConnection
  ): Promise<QueryResult<void>> => {
    const query = sql.type(z.void())`
      UPDATE
        basenaturaliste.donnee
      SET
        donnee.inventaire_id = ${newInventaireId}
      WHERE
        donnee.inventaire_id = ${currentInventaireId}
      RETURNING
        *
    `;

    return (transaction ?? slonik).query(query);
  };

  return {
    findDonneeById,
    findDonnees,
    findExistingDonnee,
    findPreviousDonneeId,
    findNextDonneeId,
    findDonneeIndex,
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
    getCountByInventaireId,
    getCountByLieuditId,
    getCountByMeteoId,
    getCountByMilieuId,
    getCountByObservateurId,
    getCountBySexeId,
    createDonnee,
    updateDonnee,
    deleteDonneeById,
    updateAssociatedInventaire,
  };
};

export type DonneeRepository = ReturnType<typeof buildDonneeRepository>;
