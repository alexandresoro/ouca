import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../repository-helpers";
import { ageSchema, type Age } from "./age-repository-types";

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

  return {
    findAgeById,
    getCount,
  };
};

export type AgeRepository = ReturnType<typeof buildAgeRepository>;
