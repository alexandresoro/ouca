import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common.js";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectToKeyValueInsert,
  objectToKeyValueSet,
  objectsToKeyValueInsert,
} from "../repository-helpers.js";
import {
  departementSchema,
  type Departement,
  type DepartementCreateInput,
  type DepartementFindManyInput,
} from "./departement-repository-types.js";

export type DepartementRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildDepartementRepository = ({ slonik }: DepartementRepositoryDependencies) => {
  const findDepartementById = async (id: number): Promise<Departement | null> => {
    const query = sql.type(departementSchema)`
      SELECT 
        departement.id::text,
        departement.code,
        departement.owner_id
      FROM
        basenaturaliste.departement
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findDepartementByCommuneId = async (communeId: number | undefined): Promise<Departement | null> => {
    if (!communeId) {
      return null;
    }

    const query = sql.type(departementSchema)`
      SELECT 
        departement.id::text,
        departement.code,
        departement.owner_id
      FROM
        basenaturaliste.departement
      LEFT JOIN basenaturaliste.commune ON departement.id = commune.departement_id
      WHERE
        commune.id = ${communeId}
    `;

    return slonik.maybeOne(query);
  };

  const findDepartements = async ({
    orderBy,
    sortOrder,
    q,
    offset,
    limit,
  }: DepartementFindManyInput = {}): Promise<readonly Departement[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const isSortByNbLieuxDits = orderBy === "nbLieuxDits";
    const isSortByNbCommunes = orderBy === "nbCommunes";
    const codeLike = q ? `%${q}%` : null;
    // If no explicit order is requested and a query is provided, return the matches in the following order:
    // The ones for which code starts with query
    // Then the ones which code contains the query
    // Then two groups are finally sorted alphabetically
    const matchStartCode = q ? `^${q}` : null;
    const query = sql.type(departementSchema)`
    SELECT 
      departement.id::text,
      departement.code,
      departement.owner_id
    FROM
      basenaturaliste.departement
    ${
      isSortByNbDonnees || isSortByNbLieuxDits || isSortByNbCommunes
        ? sql.fragment`
        LEFT JOIN basenaturaliste.commune ON departement.id = commune.departement_id`
        : sql.fragment``
    }
    ${
      isSortByNbDonnees || isSortByNbLieuxDits
        ? sql.fragment`
        LEFT JOIN basenaturaliste.lieudit ON commune.id = lieudit.commune_id`
        : sql.fragment``
    }
    ${
      isSortByNbDonnees
        ? sql.fragment`
        LEFT JOIN basenaturaliste.inventaire ON lieudit.id = inventaire.lieudit_id
        LEFT JOIN basenaturaliste.donnee ON inventaire.id = donnee.inventaire_id`
        : sql.fragment``
    }
    ${
      codeLike
        ? sql.fragment`
    WHERE unaccent(departement.code) ILIKE unaccent(${codeLike})
    `
        : sql.fragment``
    }
    ${
      isSortByNbDonnees || isSortByNbLieuxDits || isSortByNbCommunes
        ? sql.fragment`GROUP BY departement."id"`
        : sql.fragment``
    }
    ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
    ${isSortByNbLieuxDits ? sql.fragment`ORDER BY COUNT(lieudit."id")` : sql.fragment``}
    ${isSortByNbCommunes ? sql.fragment`ORDER BY COUNT(commune."id")` : sql.fragment``}
    ${
      !orderBy && q
        ? sql.fragment`ORDER BY (departement.code ~* ${matchStartCode}) DESC, departement.code ASC`
        : sql.fragment``
    }
    ${
      !isSortByNbDonnees && !isSortByNbLieuxDits && !isSortByNbCommunes && orderBy
        ? sql.fragment`ORDER BY ${sql.identifier([orderBy])}`
        : sql.fragment``
    }${buildSortOrderFragment({
      orderBy,
      sortOrder,
    })}
    ${buildPaginationFragment({ offset, limit })}
  `;

    return slonik.any(query);
  };

  const getCount = async (q?: string | null): Promise<number> => {
    const codeLike = q ? `%${q}%` : null;
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.departement
      ${
        codeLike
          ? sql.fragment`
          WHERE unaccent(code) ILIKE unaccent(${codeLike})
          `
          : sql.fragment``
      }
    `;

    return slonik.oneFirst(query);
  };

  const createDepartement = async (departementInput: DepartementCreateInput): Promise<Departement> => {
    const query = sql.type(departementSchema)`
      INSERT INTO
        basenaturaliste.departement
        ${objectToKeyValueInsert(departementInput)}
      RETURNING
        departement.id::text,
        departement.code,
        departement.owner_id
    `;

    return slonik.one(query);
  };

  const createDepartements = async (departementInputs: DepartementCreateInput[]): Promise<readonly Departement[]> => {
    const query = sql.type(departementSchema)`
      INSERT INTO
        basenaturaliste.departement
        ${objectsToKeyValueInsert(departementInputs)}
      RETURNING
        departement.id::text,
        departement.code,
        departement.owner_id
    `;

    return slonik.many(query);
  };

  const updateDepartement = async (
    departementId: number,
    departementInput: DepartementCreateInput
  ): Promise<Departement> => {
    const query = sql.type(departementSchema)`
      UPDATE
        basenaturaliste.departement
      SET
        ${objectToKeyValueSet(departementInput)}
      WHERE
        id = ${departementId}
      RETURNING
        departement.id::text,
        departement.code,
        departement.owner_id
    `;

    return slonik.one(query);
  };

  const deleteDepartementById = async (departementId: number): Promise<Departement> => {
    const query = sql.type(departementSchema)`
      DELETE
      FROM
        basenaturaliste.departement
      WHERE
        id = ${departementId}
      RETURNING
        departement.id::text,
        departement.code,
        departement.owner_id
    `;

    return slonik.one(query);
  };

  return {
    findDepartementById,
    findDepartementByCommuneId,
    findDepartements,
    getCount,
    createDepartement,
    createDepartements,
    updateDepartement,
    deleteDepartementById,
  };
};

export type DepartementRepository = ReturnType<typeof buildDepartementRepository>;
