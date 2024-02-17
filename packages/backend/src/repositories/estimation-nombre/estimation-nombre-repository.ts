import {
  numberEstimateSchema,
  type NumberEstimate,
  type NumberEstimateFindManyInput,
} from "@domain/number-estimate/number-estimate.js";
import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common.js";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectToKeyValueInsert,
  objectToKeyValueSet,
  objectsToKeyValueInsert,
} from "../repository-helpers.js";
import { type EstimationNombreCreateInput } from "./estimation-nombre-repository-types.js";

export type EstimationNombreRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildEstimationNombreRepository = ({ slonik }: EstimationNombreRepositoryDependencies) => {
  const findEstimationNombreById = async (id: number): Promise<NumberEstimate | null> => {
    const query = sql.type(numberEstimateSchema)`
      SELECT 
        estimation_nombre.id::text,
        estimation_nombre.libelle,
        estimation_nombre.non_compte,
        estimation_nombre.owner_id
      FROM
        basenaturaliste.estimation_nombre
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findEstimationNombreByDonneeId = async (donneeId: number | undefined): Promise<NumberEstimate | null> => {
    if (!donneeId) {
      return null;
    }

    const query = sql.type(numberEstimateSchema)`
      SELECT 
        estimation_nombre.id::text,
        estimation_nombre.libelle,
        estimation_nombre.non_compte,
        estimation_nombre.owner_id
      FROM
        basenaturaliste.estimation_nombre
      LEFT JOIN basenaturaliste.donnee ON estimation_nombre.id = donnee.estimation_nombre_id
      WHERE
        donnee.id = ${donneeId}
    `;

    return slonik.maybeOne(query);
  };

  const findEstimationsNombre = async ({
    orderBy,
    sortOrder,
    q,
    offset,
    limit,
  }: NumberEstimateFindManyInput = {}): Promise<readonly NumberEstimate[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(numberEstimateSchema)`
      SELECT 
        estimation_nombre.id::text,
        estimation_nombre.libelle,
        estimation_nombre.non_compte,
        estimation_nombre.owner_id
      FROM
        basenaturaliste.estimation_nombre
      ${
        isSortByNbDonnees
          ? sql.fragment`LEFT JOIN basenaturaliste.donnee ON estimation_nombre.id = donnee.estimation_nombre_id`
          : sql.fragment``
      }
      ${
        libelleLike
          ? sql.fragment`
      WHERE unaccent(libelle) ILIKE unaccent(${libelleLike})
      `
          : sql.fragment``
      }
      ${isSortByNbDonnees ? sql.fragment`GROUP BY estimation_nombre."id"` : sql.fragment``}
      ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
      ${
        !isSortByNbDonnees && orderBy ? sql.fragment`ORDER BY ${sql.identifier([orderBy])}` : sql.fragment``
      }${buildSortOrderFragment({
        orderBy,
        sortOrder,
      })}
      ${isSortByNbDonnees ? sql.fragment`, estimation_nombre.libelle ASC` : sql.fragment``}
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
        basenaturaliste.estimation_nombre
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

  const createEstimationNombre = async (
    estimationnombreInput: EstimationNombreCreateInput
  ): Promise<NumberEstimate> => {
    const query = sql.type(numberEstimateSchema)`
      INSERT INTO
        basenaturaliste.estimation_nombre
        ${objectToKeyValueInsert(estimationnombreInput)}
      RETURNING
        estimation_nombre.id::text,
        estimation_nombre.libelle,
        estimation_nombre.non_compte,
        estimation_nombre.owner_id
    `;

    return slonik.one(query);
  };

  const createEstimationsNombre = async (
    estimationnombreInputs: EstimationNombreCreateInput[]
  ): Promise<readonly NumberEstimate[]> => {
    const query = sql.type(numberEstimateSchema)`
      INSERT INTO
        basenaturaliste.estimation_nombre
        ${objectsToKeyValueInsert(estimationnombreInputs)}
      RETURNING
        estimation_nombre.id::text,
        estimation_nombre.libelle,
        estimation_nombre.non_compte,
        estimation_nombre.owner_id
    `;

    return slonik.many(query);
  };

  const updateEstimationNombre = async (
    estimationnombreId: number,
    estimationnombreInput: EstimationNombreCreateInput
  ): Promise<NumberEstimate> => {
    const query = sql.type(numberEstimateSchema)`
      UPDATE
        basenaturaliste.estimation_nombre
      SET
        ${objectToKeyValueSet(estimationnombreInput)}
      WHERE
        id = ${estimationnombreId}
      RETURNING
        estimation_nombre.id::text,
        estimation_nombre.libelle,
        estimation_nombre.non_compte,
        estimation_nombre.owner_id
    `;

    return slonik.one(query);
  };

  const deleteEstimationNombreById = async (estimationnombreId: number): Promise<NumberEstimate> => {
    const query = sql.type(numberEstimateSchema)`
      DELETE
      FROM
        basenaturaliste.estimation_nombre
      WHERE
        id = ${estimationnombreId}
      RETURNING
        estimation_nombre.id::text,
        estimation_nombre.libelle,
        estimation_nombre.non_compte,
        estimation_nombre.owner_id
    `;

    return slonik.one(query);
  };

  return {
    findEstimationNombreById,
    findEstimationNombreByDonneeId,
    findEstimationsNombre,
    getCount,
    createEstimationNombre,
    createEstimationsNombre,
    updateEstimationNombre,
    deleteEstimationNombreById,
  };
};

export type EstimationNombreRepository = ReturnType<typeof buildEstimationNombreRepository>;
