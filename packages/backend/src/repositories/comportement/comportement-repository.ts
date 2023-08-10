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
  comportementSchema,
  type Comportement,
  type ComportementCreateInput,
  type ComportementFindManyInput,
} from "./comportement-repository-types.js";

export type ComportementRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildComportementRepository = ({ slonik }: ComportementRepositoryDependencies) => {
  const findComportementById = async (id: number): Promise<Comportement | null> => {
    const query = sql.type(comportementSchema)`
      SELECT 
        comportement.id::text,
        comportement.code,
        comportement.libelle,
        comportement.nicheur,
        comportement.owner_id
      FROM
        basenaturaliste.comportement
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findComportementsOfDonneeId = async (donneeId: number | undefined): Promise<readonly Comportement[]> => {
    if (!donneeId) {
      return [];
    }

    const query = sql.type(comportementSchema)`
      SELECT 
        comportement.id::text,
        comportement.code,
        comportement.libelle,
        comportement.nicheur,
        comportement.owner_id
      FROM
        basenaturaliste.comportement
      LEFT JOIN basenaturaliste.donnee_comportement ON comportement.id = donnee_comportement.comportement_id
      WHERE
        donnee_comportement.donnee_id = ${donneeId}
    `;

    return slonik.any(query);
  };

  const findComportements = async ({
    orderBy,
    sortOrder,
    q,
    offset,
    limit,
  }: ComportementFindManyInput = {}): Promise<readonly Comportement[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const codeLike = q ? `^0*${q}` : null;
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(comportementSchema)`
    SELECT 
      comportement.id::text,
      comportement.code,
      comportement.libelle,
      comportement.nicheur,
      comportement.owner_id
    FROM
      basenaturaliste.comportement
    ${
      isSortByNbDonnees
        ? sql.fragment`
          LEFT JOIN basenaturaliste.donnee_comportement ON comportement.id = donnee_comportement.comportement_id
          LEFT JOIN basenaturaliste.donnee ON donnee_comportement.donnee_id = donnee.id`
        : sql.fragment``
    }
    ${
      codeLike
        ? sql.fragment`
    WHERE
      code ~* ${codeLike}
      OR unaccent(libelle) ILIKE unaccent(${libelleLike})
    `
        : sql.fragment``
    }
    ${isSortByNbDonnees ? sql.fragment`GROUP BY comportement."id"` : sql.fragment``}
    ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
    ${!isSortByNbDonnees && orderBy ? sql.fragment`ORDER BY ${sql.identifier([orderBy])}` : sql.fragment``}
    ${
      !orderBy && codeLike
        ? sql.fragment`ORDER BY (comportement.code ~* ${codeLike}) DESC, comportement.code ASC`
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

  const getCount = async (q?: string | null): Promise<number> => {
    const codeLike = q ? `^0*${q}` : null;
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.comportement
      ${
        codeLike
          ? sql.fragment`
              WHERE
                code ~* ${codeLike}
                OR unaccent(libelle) ILIKE unaccent(${libelleLike})
          `
          : sql.fragment``
      }
    `;

    return slonik.oneFirst(query);
  };

  const createComportement = async (comportementInput: ComportementCreateInput): Promise<Comportement> => {
    const query = sql.type(comportementSchema)`
      INSERT INTO
        basenaturaliste.comportement
        ${objectToKeyValueInsert(comportementInput)}
      RETURNING
        comportement.id::text,
        comportement.code,
        comportement.libelle,
        comportement.nicheur,
        comportement.owner_id
    `;

    return slonik.one(query);
  };

  const createComportements = async (
    comportementInputs: ComportementCreateInput[]
  ): Promise<readonly Comportement[]> => {
    const query = sql.type(comportementSchema)`
      INSERT INTO
        basenaturaliste.comportement
        ${objectsToKeyValueInsert(comportementInputs)}
      RETURNING
        comportement.id::text,
        comportement.code,
        comportement.libelle,
        comportement.nicheur,
        comportement.owner_id
    `;

    return slonik.many(query);
  };

  const updateComportement = async (
    comportementId: number,
    comportementInput: ComportementCreateInput
  ): Promise<Comportement> => {
    const query = sql.type(comportementSchema)`
      UPDATE
        basenaturaliste.comportement
      SET
        ${objectToKeyValueSet(comportementInput)}
      WHERE
        id = ${comportementId}
      RETURNING
        comportement.id::text,
        comportement.code,
        comportement.libelle,
        comportement.nicheur,
        comportement.owner_id
    `;

    return slonik.one(query);
  };

  const deleteComportementById = async (comportementId: number): Promise<Comportement> => {
    const query = sql.type(comportementSchema)`
      DELETE
      FROM
        basenaturaliste.comportement
      WHERE
        id = ${comportementId}
      RETURNING
        comportement.id::text,
        comportement.code,
        comportement.libelle,
        comportement.nicheur,
        comportement.owner_id
    `;

    return slonik.one(query);
  };

  return {
    findComportementById,
    findComportementsOfDonneeId,
    findComportements,
    getCount,
    createComportement,
    createComportements,
    updateComportement,
    deleteComportementById,
  };
};

export type ComportementRepository = ReturnType<typeof buildComportementRepository>;
