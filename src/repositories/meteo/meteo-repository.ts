import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectsToKeyValueInsert,
  objectToKeyValueInsert,
  objectToKeyValueSet,
} from "../repository-helpers";
import { meteoSchema, type Meteo, type MeteoCreateInput, type MeteoFindManyInput } from "./meteo-repository-types";

export type MeteoRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildMeteoRepository = ({ slonik }: MeteoRepositoryDependencies) => {
  const findMeteoById = async (id: number): Promise<Meteo | null> => {
    const query = sql.type(meteoSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.meteo
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findMeteos = async ({ orderBy, sortOrder, q, offset, limit }: MeteoFindManyInput = {}): Promise<
    readonly Meteo[]
  > => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(meteoSchema)`
    SELECT 
      meteo.*
    FROM
      basenaturaliste.meteo
    ${
      isSortByNbDonnees
        ? sql.fragment`
        LEFT JOIN basenaturaliste.inventaire_meteo ON meteo.id = inventaire_meteo.meteo_id
        LEFT JOIN basenaturaliste.inventaire ON inventaire_meteo.inventaire_id = inventaire.id
        LEFT JOIN basenaturaliste.donnee ON inventaire.id = donnee.inventaire_id`
        : sql.fragment``
    }
    ${
      libelleLike
        ? sql.fragment`
    WHERE libelle ILIKE ${libelleLike}
    `
        : sql.fragment``
    }
    ${isSortByNbDonnees ? sql.fragment`GROUP BY meteo."id"` : sql.fragment``}
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
        basenaturaliste.meteo
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

  const createMeteo = async (meteoInput: MeteoCreateInput): Promise<Meteo> => {
    const query = sql.type(meteoSchema)`
      INSERT INTO
        basenaturaliste.meteo
        ${objectToKeyValueInsert(meteoInput)}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const createMeteos = async (meteoInputs: MeteoCreateInput[]): Promise<readonly Meteo[]> => {
    const query = sql.type(meteoSchema)`
      INSERT INTO
        basenaturaliste.meteo
        ${objectsToKeyValueInsert(meteoInputs)}
      RETURNING
        *
    `;

    return slonik.many(query);
  };

  const updateMeteo = async (meteoId: number, meteoInput: MeteoCreateInput): Promise<Meteo> => {
    const query = sql.type(meteoSchema)`
      UPDATE
        basenaturaliste.meteo
      SET
        ${objectToKeyValueSet(meteoInput)}
      WHERE
        id = ${meteoId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const deleteMeteoById = async (meteoId: number): Promise<Meteo> => {
    const query = sql.type(meteoSchema)`
      DELETE
      FROM
        basenaturaliste.meteo
      WHERE
        id = ${meteoId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  return {
    findMeteoById,
    findMeteos,
    getCount,
    createMeteo,
    createMeteos,
    updateMeteo,
    deleteMeteoById,
  };
};

export type MeteoRepository = ReturnType<typeof buildMeteoRepository>;
