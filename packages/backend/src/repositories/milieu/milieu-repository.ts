import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectsToKeyValueInsert,
  objectToKeyValueInsert,
  objectToKeyValueSet,
} from "../repository-helpers";
import { milieuSchema, type Milieu, type MilieuCreateInput, type MilieuFindManyInput } from "./milieu-repository-types";

export type MilieuRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildMilieuRepository = ({ slonik }: MilieuRepositoryDependencies) => {
  const findMilieuById = async (id: number): Promise<Milieu | null> => {
    const query = sql.type(milieuSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.milieu
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findMilieuxOfDonneeId = async (donneeId: number | undefined): Promise<readonly Milieu[]> => {
    if (!donneeId) {
      return [];
    }

    const query = sql.type(milieuSchema)`
      SELECT 
        milieu.*
      FROM
        basenaturaliste.milieu
      LEFT JOIN basenaturaliste.donnee_milieu ON milieu.id = donnee_milieu.milieu_id
      WHERE
        donnee_milieu.donnee_id = ${donneeId}
    `;

    return slonik.any(query);
  };

  const findMilieux = async ({ orderBy, sortOrder, q, offset, limit }: MilieuFindManyInput = {}): Promise<
    readonly Milieu[]
  > => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const codeStarts = q ? `${q}%` : null;
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(milieuSchema)`
    SELECT 
      milieu.*
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
      OR libelle ILIKE ${libelleLike}
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
                OR libelle ILIKE ${libelleLike}
          `
          : sql.fragment``
      }
    `;

    return slonik.oneFirst(query);
  };

  const createMilieu = async (milieuInput: MilieuCreateInput): Promise<Milieu> => {
    const query = sql.type(milieuSchema)`
      INSERT INTO
        basenaturaliste.milieu
        ${objectToKeyValueInsert(milieuInput)}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const createMilieux = async (milieuInputs: MilieuCreateInput[]): Promise<readonly Milieu[]> => {
    const query = sql.type(milieuSchema)`
      INSERT INTO
        basenaturaliste.milieu
        ${objectsToKeyValueInsert(milieuInputs)}
      RETURNING
        *
    `;

    return slonik.many(query);
  };

  const updateMilieu = async (milieuId: number, milieuInput: MilieuCreateInput): Promise<Milieu> => {
    const query = sql.type(milieuSchema)`
      UPDATE
        basenaturaliste.milieu
      SET
        ${objectToKeyValueSet(milieuInput)}
      WHERE
        id = ${milieuId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const deleteMilieuById = async (milieuId: number): Promise<Milieu> => {
    const query = sql.type(milieuSchema)`
      DELETE
      FROM
        basenaturaliste.milieu
      WHERE
        id = ${milieuId}
      RETURNING
        *
    `;

    return slonik.one(query);
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
