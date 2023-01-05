import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectsToKeyValueInsert,
  objectToKeyValueInsert,
  objectToKeyValueSet,
} from "../repository-helpers";
import { buildOrderByIdentifier, buildSearchEspeceClause } from "./espece-repository-helper";
import {
  especeSchema,
  especeWithClasseLibelleSchema,
  type Espece,
  type EspeceCreateInput,
  type EspeceFindManyInput,
  type EspeceWithClasseLibelle,
} from "./espece-repository-types";

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

  const findAllEspecesWithClasseLibelle = async (): Promise<readonly EspeceWithClasseLibelle[]> => {
    const query = sql.type(especeWithClasseLibelleSchema)`
    SELECT 
      espece.*,
      classe.libelle as classe_libelle
    FROM
      basenaturaliste.espece
    LEFT JOIN basenaturaliste.classe ON espece.classe_id = classe.id
  `;

    return slonik.any(query);
  };

  const findEspeces = async ({
    orderBy,
    sortOrder,
    q,
    searchCriteria,
    offset,
    limit,
  }: EspeceFindManyInput = {}): Promise<readonly Espece[]> => {
    const isSortByNomClasse = orderBy === "nomClasse";
    const isSortByNbDonnees = orderBy === "nbDonnees";
    // If no explicit order is requested and a query is provided, return the matches in the following order:
    // The ones for which code starts with query
    // Then the ones which code contains the query
    // Finally the ones that don't match the code (i.e. nom francais or latin) sorted by code
    const matchStartCode = q ? `^${q}` : null;
    const query = sql.type(especeSchema)`
      SELECT 
        espece.*
      FROM
        basenaturaliste.espece
      ${
        isSortByNomClasse
          ? sql.fragment`
      LEFT JOIN basenaturaliste.classe ON espece.classe_id = classe.id
        `
          : sql.fragment``
      }
      ${
        searchCriteria || isSortByNbDonnees
          ? sql.fragment`
      LEFT JOIN basenaturaliste.donnee ON donnee.espece_id = espece.id
        `
          : sql.fragment``
      }
      ${
        searchCriteria
          ? sql.fragment`
      LEFT JOIN basenaturaliste.donnee_comportement ON donnee.id = donnee_comportement.donnee_id
      LEFT JOIN basenaturaliste.comportement ON donnee_comportement.comportement_id = comportement.id
      LEFT JOIN basenaturaliste.donnee_milieu ON donnee.id = donnee_milieu.donnee_id
      LEFT JOIN basenaturaliste.milieu ON donnee_milieu.milieu_id = milieu.id
      LEFT JOIN basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
      LEFT JOIN basenaturaliste.lieudit ON inventaire.lieudit_id = lieudit.id
      LEFT JOIN basenaturaliste.commune ON lieudit.commune_id = commune.id
      LEFT JOIN basenaturaliste.inventaire_meteo ON inventaire.id = inventaire_meteo.inventaire_id
      LEFT JOIN basenaturaliste.inventaire_associe ON inventaire.id = inventaire_associe.inventaire_id
        `
          : sql.fragment``
      }
      ${buildSearchEspeceClause({ q, searchCriteria })}
      ${
        !isSortByNomClasse && (isSortByNbDonnees || searchCriteria)
          ? sql.fragment`GROUP BY espece."id"`
          : sql.fragment``
      }
      ${isSortByNomClasse ? sql.fragment`GROUP BY espece."id", classe."libelle"` : sql.fragment``}
      ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
      ${!isSortByNbDonnees && orderBy ? sql.fragment`ORDER BY ${buildOrderByIdentifier(orderBy)}` : sql.fragment``}
      ${
        !orderBy && q
          ? sql.fragment`ORDER BY (espece.code ~* ${matchStartCode}) DESC, (espece.code ~* ${q}) DESC, espece.code ASC`
          : sql.fragment``
      }
      ${buildSortOrderFragment({
        orderBy,
        sortOrder,
      })}
      ${buildPaginationFragment({ offset, limit })}
    `;

    return slonik.any(query);
  };

  const getCount = async ({
    q,
    searchCriteria,
  }: Pick<EspeceFindManyInput, "q" | "searchCriteria">): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(DISTINCT espece.id)
      FROM
        basenaturaliste.espece
      ${
        searchCriteria
          ? sql.fragment`
      LEFT JOIN basenaturaliste.donnee ON donnee.espece_id = espece.id
      LEFT JOIN basenaturaliste.donnee_comportement ON donnee.id = donnee_comportement.donnee_id
      LEFT JOIN basenaturaliste.comportement ON donnee_comportement.comportement_id = comportement.id
      LEFT JOIN basenaturaliste.donnee_milieu ON donnee.id = donnee_milieu.donnee_id
      LEFT JOIN basenaturaliste.milieu ON donnee_milieu.milieu_id = milieu.id
      LEFT JOIN basenaturaliste.inventaire ON donnee.inventaire_id = inventaire.id
      LEFT JOIN basenaturaliste.lieudit ON inventaire.lieudit_id = lieudit.id
      LEFT JOIN basenaturaliste.commune ON lieudit.commune_id = commune.id
      LEFT JOIN basenaturaliste.inventaire_meteo ON inventaire.id = inventaire_meteo.inventaire_id
      LEFT JOIN basenaturaliste.inventaire_associe ON inventaire.id = inventaire_associe.inventaire_id
        `
          : sql.fragment``
      }
      ${buildSearchEspeceClause({ q, searchCriteria })}
    `;

    return slonik.oneFirst(query);
  };

  const createEspece = async (especeInput: EspeceCreateInput): Promise<Espece> => {
    const query = sql.type(especeSchema)`
      INSERT INTO
        basenaturaliste.espece
        ${objectToKeyValueInsert(especeInput)}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const createEspeces = async (especeInputs: EspeceCreateInput[]): Promise<readonly Espece[]> => {
    const query = sql.type(especeSchema)`
      INSERT INTO
        basenaturaliste.espece
        ${objectsToKeyValueInsert(especeInputs)}
      RETURNING
        *
    `;

    return slonik.many(query);
  };

  const updateEspece = async (especeId: number, especeInput: EspeceCreateInput): Promise<Espece> => {
    const query = sql.type(especeSchema)`
      UPDATE
        basenaturaliste.espece
      SET
        ${objectToKeyValueSet(especeInput)}
      WHERE
        id = ${especeId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const deleteEspeceById = async (especeId: number): Promise<Espece> => {
    const query = sql.type(especeSchema)`
      DELETE
      FROM
        basenaturaliste.espece
      WHERE
        id = ${especeId}
      RETURNING
        *
    `;

    return slonik.one(query);
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
    findAllEspecesWithClasseLibelle,
    findEspeces,
    getCount,
    createEspece,
    createEspeces,
    updateEspece,
    deleteEspeceById,
    getCountByClasseId,
  };
};

export type EspeceRepository = ReturnType<typeof buildEspeceRepository>;
