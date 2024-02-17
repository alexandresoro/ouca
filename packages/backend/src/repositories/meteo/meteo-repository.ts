import { weatherSchema, type Weather, type WeatherFindManyInput } from "@domain/weather/weather.js";
import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common.js";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectToKeyValueInsert,
  objectToKeyValueSet,
  objectsToKeyValueInsert,
} from "../repository-helpers.js";
import { type MeteoCreateInput } from "./meteo-repository-types.js";

export type MeteoRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildMeteoRepository = ({ slonik }: MeteoRepositoryDependencies) => {
  const findMeteoById = async (id: number): Promise<Weather | null> => {
    const query = sql.type(weatherSchema)`
      SELECT 
        meteo.id::text,
        meteo.libelle,
        meteo.owner_id
      FROM
        basenaturaliste.meteo
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findMeteosOfInventaireId = async (inventaireId: number | undefined): Promise<readonly Weather[]> => {
    if (!inventaireId) {
      return [];
    }

    const query = sql.type(weatherSchema)`
      SELECT 
        meteo.id::text,
        meteo.libelle,
        meteo.owner_id
      FROM
        basenaturaliste.meteo
      LEFT JOIN basenaturaliste.inventaire_meteo ON meteo.id = inventaire_meteo.meteo_id
      WHERE
        inventaire_meteo.inventaire_id = ${inventaireId}
    `;

    return slonik.any(query);
  };

  const findMeteos = async ({
    orderBy,
    sortOrder,
    q,
    offset,
    limit,
  }: WeatherFindManyInput = {}): Promise<readonly Weather[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(weatherSchema)`
    SELECT 
      meteo.id::text,
      meteo.libelle,
      meteo.owner_id
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
    WHERE unaccent(libelle) ILIKE unaccent(${libelleLike})
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
    ${isSortByNbDonnees ? sql.fragment`, meteo.libelle ASC` : sql.fragment``}
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
                unaccent(libelle) ILIKE unaccent(${libelleLike})
          `
          : sql.fragment``
      }
    `;

    return slonik.oneFirst(query);
  };

  const createMeteo = async (meteoInput: MeteoCreateInput): Promise<Weather> => {
    const query = sql.type(weatherSchema)`
      INSERT INTO
        basenaturaliste.meteo
        ${objectToKeyValueInsert(meteoInput)}
      RETURNING
        meteo.id::text,
        meteo.libelle,
        meteo.owner_id
    `;

    return slonik.one(query);
  };

  const createMeteos = async (meteoInputs: MeteoCreateInput[]): Promise<readonly Weather[]> => {
    const query = sql.type(weatherSchema)`
      INSERT INTO
        basenaturaliste.meteo
        ${objectsToKeyValueInsert(meteoInputs)}
      RETURNING
        meteo.id::text,
        meteo.libelle,
        meteo.owner_id
    `;

    return slonik.many(query);
  };

  const updateMeteo = async (meteoId: number, meteoInput: MeteoCreateInput): Promise<Weather> => {
    const query = sql.type(weatherSchema)`
      UPDATE
        basenaturaliste.meteo
      SET
        ${objectToKeyValueSet(meteoInput)}
      WHERE
        id = ${meteoId}
      RETURNING
        meteo.id::text,
        meteo.libelle,
        meteo.owner_id
    `;

    return slonik.one(query);
  };

  const deleteMeteoById = async (meteoId: number): Promise<Weather> => {
    const query = sql.type(weatherSchema)`
      DELETE
      FROM
        basenaturaliste.meteo
      WHERE
        id = ${meteoId}
      RETURNING
        meteo.id::text,
        meteo.libelle,
        meteo.owner_id
    `;

    return slonik.one(query);
  };

  return {
    findMeteoById,
    findMeteosOfInventaireId,
    findMeteos,
    getCount,
    createMeteo,
    createMeteos,
    updateMeteo,
    deleteMeteoById,
  };
};

export type MeteoRepository = ReturnType<typeof buildMeteoRepository>;
