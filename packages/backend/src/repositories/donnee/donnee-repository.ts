import { type DatabasePool, sql } from "slonik";
import { countSchema } from "../common.js";
import { buildPaginationFragment, buildSortOrderFragment } from "../repository-helpers.js";
import {
  buildFindMatchingDonneeClause,
  buildOrderByIdentifier,
  buildSearchCriteriaClause,
} from "./donnee-repository-helper.js";
import {
  type Donnee,
  type DonneeFindManyInput,
  type DonneeFindMatchingInput,
  donneeSchema,
} from "./donnee-repository-types.js";

export type DonneeRepositoryDependencies = {
  slonik: DatabasePool;
};

/**
 * @deprecated
 */
export const buildDonneeRepository = ({ slonik }: DonneeRepositoryDependencies) => {
  const findDonnees = async ({
    orderBy,
    sortOrder,
    searchCriteria,
    offset,
    limit,
  }: DonneeFindManyInput = {}): Promise<readonly Donnee[]> => {
    const query = sql.type(donneeSchema)`
      SELECT
        donnee.id::text,
        donnee.inventaire_id::text,
        donnee.espece_id::text,
        donnee.sexe_id::text,
        donnee.age_id::text,
        donnee.estimation_nombre_id::text,
        donnee.nombre,
        donnee.estimation_distance_id::text,
        donnee.distance,
        donnee.commentaire,
        donnee.regroupement,
        donnee.date_creation
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
    const { behaviorIds, environmentIds } = criteria;

    // TODO the match is a bit too wide, meaning that a missing/null criteria will have no
    // associated where clause, but we can consider this as acceptable
    const query = sql.type(donneeSchema)`
      SELECT
        donnee.id::text,
        donnee.inventaire_id::text,
        donnee.espece_id::text,
        donnee.sexe_id::text,
        donnee.age_id::text,
        donnee.estimation_nombre_id::text,
        donnee.nombre,
        donnee.estimation_distance_id::text,
        donnee.distance,
        donnee.commentaire,
        donnee.regroupement,
        donnee.date_creation
      FROM
        basenaturaliste.donnee
      LEFT JOIN
	      basenaturaliste.donnee_comportement ON donnee_comportement.donnee_id = donnee.id
      LEFT JOIN
	      basenaturaliste.donnee_milieu ON donnee_milieu.donnee_id = donnee.id
      ${buildFindMatchingDonneeClause(criteria)}
      GROUP BY donnee.id
      HAVING 
        COUNT(DISTINCT donnee_comportement.comportement_id) = ${behaviorIds?.length ?? 0}
        AND COUNT(DISTINCT donnee_milieu.milieu_id) = ${environmentIds?.length ?? 0}
      LIMIT 1
    `;

    return slonik.maybeOne(query);
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

  return {
    /**
     * @deprecated
     */
    findDonnees,
    /**
     * @deprecated
     */
    findExistingDonnee,
    /**
     * @deprecated
     */
    getCount,
  };
};

/**
 * @deprecated
 */
export type DonneeRepository = ReturnType<typeof buildDonneeRepository>;
