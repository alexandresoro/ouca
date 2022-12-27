import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectsToKeyValueInsert,
  objectToKeyValueInsert,
  objectToKeyValueSet,
} from "../repository-helpers";
import {
  ageSchema,
  ageWithNbSpecimensSchema,
  type Age,
  type AgeCreateInput,
  type AgeFindManyInput,
  type AgeWithNbSpecimens,
} from "./age-repository-types";

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

  const findAgeByDonneeId = async (donneeId: number | undefined): Promise<Age | null> => {
    if (!donneeId) {
      return null;
    }

    const query = sql.type(ageSchema)`
      SELECT 
        age.*
      FROM
        basenaturaliste.age
      LEFT JOIN basenaturaliste.donnee ON age.id = donnee.age_id
      WHERE
        donnee.id = ${donneeId}
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
      ${
        libelleLike
          ? sql.fragment`
      WHERE libelle ILIKE ${libelleLike}
      `
          : sql.fragment``
      }
      ${isSortByNbDonnees ? sql.fragment`GROUP BY age."id"` : sql.fragment``}
      ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
      ${
        !isSortByNbDonnees && orderBy ? sql.fragment`ORDER BY ${sql.identifier([orderBy])}` : sql.fragment``
      }${buildSortOrderFragment({
      orderBy,
      sortOrder,
    })}
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

  const getAgesWithNbSpecimensForEspeceId = async (especeId: number): Promise<readonly AgeWithNbSpecimens[]> => {
    const query = sql.type(ageWithNbSpecimensSchema)`
      SELECT
        age.*,
        SUM(donnee.nombre) as nb_specimens
      FROM 
        basenaturaliste.age
      LEFT JOIN basenaturaliste.donnee on donnee.age_id = age.id
      WHERE donnee.espece_id = ${especeId}
      GROUP BY age.id
      ORDER BY age.id
    `;

    return slonik.any(query);
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
    findAgeByDonneeId,
    findAges,
    getCount,
    getAgesWithNbSpecimensForEspeceId,
    createAge,
    createAges,
    updateAge,
    deleteAgeById,
  };
};

export type AgeRepository = ReturnType<typeof buildAgeRepository>;
