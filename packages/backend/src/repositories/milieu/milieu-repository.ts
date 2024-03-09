import { type Environment, type EnvironmentFindManyInput, environmentSchema } from "@domain/environment/environment.js";
import { type DatabasePool, sql } from "slonik";
import { countSchema } from "../common.js";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectToKeyValueInsert,
  objectToKeyValueSet,
  objectsToKeyValueInsert,
} from "../repository-helpers.js";
import type { MilieuCreateInput } from "./milieu-repository-types.js";

export type MilieuRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildMilieuRepository = ({ slonik }: MilieuRepositoryDependencies) => {
  const findMilieuById = async (id: number): Promise<Environment | null> => {
    const query = sql.type(environmentSchema)`
      SELECT 
        milieu.id::text,
        milieu.code,
        milieu.libelle,
        milieu.owner_id
      FROM
        basenaturaliste.milieu
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findMilieuxOfDonneeId = async (entryId: number | undefined): Promise<readonly Environment[]> => {
    if (!entryId) {
      return [];
    }

    const query = sql.type(environmentSchema)`
      SELECT 
        milieu.id::text,
        milieu.code,
        milieu.libelle,
        milieu.owner_id
      FROM
        basenaturaliste.milieu
      LEFT JOIN basenaturaliste.donnee_milieu ON milieu.id = donnee_milieu.milieu_id
      WHERE
        donnee_milieu.donnee_id = ${entryId}
    `;

    return slonik.any(query);
  };

  const findMilieux = async ({
    orderBy,
    sortOrder,
    q,
    offset,
    limit,
  }: EnvironmentFindManyInput = {}): Promise<readonly Environment[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const codeStarts = q ? `${q}%` : null;
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(environmentSchema)`
    SELECT 
      milieu.id::text,
      milieu.code,
      milieu.libelle,
      milieu.owner_id
    FROM
      basenaturaliste.milieu
    ${
      isSortByNbDonnees
        ? sql.fragment`
          LEFT JOIN basenaturaliste.donnee_milieu ON milieu.id = donnee_milieu.milieu_id
          LEFT JOIN basenaturaliste.donnee ON donnee_milieu.donnee_id = donnee.id`
        : sql.fragment``
    }
    ${
      codeStarts
        ? sql.fragment`
    WHERE
      code ILIKE ${codeStarts}
      OR unaccent(libelle) ILIKE unaccent(${libelleLike})
    `
        : sql.fragment``
    }
    ${isSortByNbDonnees ? sql.fragment`GROUP BY milieu."id"` : sql.fragment``}
    ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
    ${!isSortByNbDonnees && orderBy ? sql.fragment`ORDER BY ${sql.identifier([orderBy])}` : sql.fragment``}
    ${
      !orderBy && codeStarts
        ? sql.fragment`ORDER BY (milieu.code ILIKE ${codeStarts}) DESC, milieu.code ASC`
        : sql.fragment``
    }
    ${buildSortOrderFragment({
      orderBy,
      sortOrder,
    })}
    ${isSortByNbDonnees ? sql.fragment`, milieu.code ASC` : sql.fragment``}
    ${buildPaginationFragment({ offset, limit })}
  `;

    return slonik.any(query);
  };

  const getCount = async (q?: string | null): Promise<number> => {
    const codeStarts = q ? `${q}%` : null;
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.milieu
      ${
        codeStarts
          ? sql.fragment`
              WHERE
                code ILIKE ${codeStarts}
                OR unaccent(libelle) ILIKE unaccent(${libelleLike})
          `
          : sql.fragment``
      }
    `;

    return slonik.oneFirst(query);
  };

  const createMilieu = async (milieuInput: MilieuCreateInput): Promise<Environment> => {
    const query = sql.type(environmentSchema)`
      INSERT INTO
        basenaturaliste.milieu
        ${objectToKeyValueInsert(milieuInput)}
      RETURNING
        milieu.id::text,
        milieu.code,
        milieu.libelle,
        milieu.owner_id
    `;

    return slonik.one(query);
  };

  const createMilieux = async (milieuInputs: MilieuCreateInput[]): Promise<readonly Environment[]> => {
    const query = sql.type(environmentSchema)`
      INSERT INTO
        basenaturaliste.milieu
        ${objectsToKeyValueInsert(milieuInputs)}
      RETURNING
        milieu.id::text,
        milieu.code,
        milieu.libelle,
        milieu.owner_id
    `;

    return slonik.many(query);
  };

  const updateMilieu = async (milieuId: number, milieuInput: MilieuCreateInput): Promise<Environment> => {
    const query = sql.type(environmentSchema)`
      UPDATE
        basenaturaliste.milieu
      SET
        ${objectToKeyValueSet(milieuInput)}
      WHERE
        id = ${milieuId}
      RETURNING
        milieu.id::text,
        milieu.code,
        milieu.libelle,
        milieu.owner_id
    `;

    return slonik.one(query);
  };

  const deleteMilieuById = async (milieuId: number): Promise<Environment | null> => {
    const query = sql.type(environmentSchema)`
      DELETE
      FROM
        basenaturaliste.milieu
      WHERE
        id = ${milieuId}
      RETURNING
        milieu.id::text,
        milieu.code,
        milieu.libelle,
        milieu.owner_id
    `;

    return slonik.maybeOne(query);
  };

  return {
    findMilieuById,
    findMilieuxOfDonneeId,
    findMilieux,
    getCount,
    createMilieu,
    createMilieux,
    updateMilieu,
    deleteMilieuById,
  };
};

export type MilieuRepository = ReturnType<typeof buildMilieuRepository>;
