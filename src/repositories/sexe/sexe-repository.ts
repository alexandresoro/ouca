import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectsToKeyValueInsert,
  objectToKeyValueInsert,
  objectToKeyValueSet,
} from "../repository-helpers";
import { sexeSchema, type Sexe, type SexeCreateInput, type SexeFindManyInput } from "./sexe-repository-types";

export type SexeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildSexeRepository = ({ slonik }: SexeRepositoryDependencies) => {
  const findSexeById = async (id: number): Promise<Sexe | null> => {
    const query = sql.type(sexeSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.sexe
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findSexes = async ({ orderBy, sortOrder, q, offset, limit }: SexeFindManyInput = {}): Promise<
    readonly Sexe[]
  > => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(sexeSchema)`
      SELECT 
        sexe.*
      FROM
        basenaturaliste.sexe
      ${isSortByNbDonnees ? sql.fragment`LEFT JOIN basenaturaliste.donnee ON sexe.id = donnee.sexe_id` : sql.fragment``}
      ${
        libelleLike
          ? sql.fragment`
      WHERE libelle ILIKE ${libelleLike}
      `
          : sql.fragment``
      }
      ${isSortByNbDonnees ? sql.fragment`GROUP BY sexe."id"` : sql.fragment``}
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
        basenaturaliste.sexe
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

  const createSexe = async (sexeInput: SexeCreateInput): Promise<Sexe> => {
    const query = sql.type(sexeSchema)`
      INSERT INTO
        basenaturaliste.sexe
        ${objectToKeyValueInsert(sexeInput)}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const createSexes = async (sexeInputs: SexeCreateInput[]): Promise<readonly Sexe[]> => {
    const query = sql.type(sexeSchema)`
      INSERT INTO
        basenaturaliste.sexe
        ${objectsToKeyValueInsert(sexeInputs)}
      RETURNING
        *
    `;

    return slonik.many(query);
  };

  const updateSexe = async (sexeId: number, sexeInput: SexeCreateInput): Promise<Sexe> => {
    const query = sql.type(sexeSchema)`
      UPDATE
        basenaturaliste.sexe
      SET
        ${objectToKeyValueSet(sexeInput)}
      WHERE
        id = ${sexeId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const deleteSexeById = async (sexeId: number): Promise<Sexe> => {
    const query = sql.type(sexeSchema)`
      DELETE
      FROM
        basenaturaliste.sexe
      WHERE
        id = ${sexeId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  return {
    findSexeById,
    findSexes,
    getCount,
    createSexe,
    createSexes,
    updateSexe,
    deleteSexeById,
  };
};

export type SexeRepository = ReturnType<typeof buildSexeRepository>;
