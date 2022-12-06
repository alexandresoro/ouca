import { sql, type DatabasePool } from "slonik";
import { objectsToKeyValueInsert, objectToKeyValueInsert, objectToKeyValueSet } from "../../utils/slonik-utils";
import { buildPaginationFragment, buildSortOrderFragment, countSchema } from "../repository-helpers";
import { ageSchema, type Age, type AgeCreateInput, type AgeFindManyInput } from "./age-repository-types";

export type AgeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildAgeRepository = ({ slonik }: AgeRepositoryDependencies) => {
  const findAgeById = async (id: number): Promise<Age | null> => {
    const query = sql.type(ageSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.age
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findAges = async ({ orderBy, sortOrder, q, offset, limit }: AgeFindManyInput = {}): Promise<readonly Age[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(ageSchema)`
      SELECT 
        age.*
      FROM
        basenaturaliste.age
      ${isSortByNbDonnees ? sql.fragment`LEFT JOIN basenaturaliste.donnee ON age.id = donnee.age_id` : sql.fragment``}
      ${isSortByNbDonnees ? sql.fragment`GROUP BY age."id"` : sql.fragment``}
      ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
      ${
        !isSortByNbDonnees && orderBy ? sql.fragment`ORDER BY ${sql.identifier([orderBy])}` : sql.fragment``
      }${buildSortOrderFragment({
      orderBy,
      sortOrder,
    })}
      ${
        libelleLike
          ? sql.fragment`
      WHERE libelle ILIKE ${libelleLike}
      `
          : sql.fragment``
      }
      ${buildPaginationFragment({ offset, limit })}
    `;

    return slonik.any(query);
  };

  const getCount = async (q?: string | null): Promise<number> => {
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.age
      ${
        libelleLike
          ? sql.fragment`
              WHERE
                libelle ILIKE ${libelleLike}
          `
          : sql.fragment``
      }
    `;

    return slonik.oneFirst(query);
  };

  const createAge = async (ageInput: AgeCreateInput): Promise<Age> => {
    const query = sql.type(ageSchema)`
      INSERT INTO
        basenaturaliste.age
        ${objectToKeyValueInsert(ageInput)}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const createAges = async (ageInputs: AgeCreateInput[]): Promise<readonly Age[]> => {
    const query = sql.type(ageSchema)`
      INSERT INTO
        basenaturaliste.age
        ${objectsToKeyValueInsert(ageInputs)}
      RETURNING
        *
    `;

    return slonik.many(query);
  };

  const updateAge = async (ageId: number, ageInput: AgeCreateInput): Promise<Age> => {
    const query = sql.type(ageSchema)`
      UPDATE
        basenaturaliste.age
      SET
        ${objectToKeyValueSet(ageInput)}
      WHERE
        id = ${ageId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const deleteAgeById = async (ageId: number): Promise<Age> => {
    const query = sql.type(ageSchema)`
      DELETE
      FROM
        basenaturaliste.age
      WHERE
        id = ${ageId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  return {
    findAgeById,
    findAges,
    getCount,
    createAge,
    createAges,
    updateAge,
    deleteAgeById,
  };
};

export type AgeRepository = ReturnType<typeof buildAgeRepository>;
