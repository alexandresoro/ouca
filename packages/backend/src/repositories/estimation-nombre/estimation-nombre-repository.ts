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
  estimationNombreSchema,
  type EstimationNombre,
  type EstimationNombreCreateInput,
  type EstimationNombreFindManyInput,
} from "./estimation-nombre-repository-types.js";

export type EstimationNombreRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildEstimationNombreRepository = ({ slonik }: EstimationNombreRepositoryDependencies) => {
  const findEstimationNombreById = async (id: number): Promise<EstimationNombre | null> => {
    const query = sql.type(estimationNombreSchema)`
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

  const findEstimationNombreByDonneeId = async (donneeId: number | undefined): Promise<EstimationNombre | null> => {
    if (!donneeId) {
      return null;
    }

    const query = sql.type(estimationNombreSchema)`
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
  }: EstimationNombreFindManyInput = {}): Promise<readonly EstimationNombre[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(estimationNombreSchema)`
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
  ): Promise<EstimationNombre> => {
    const query = sql.type(estimationNombreSchema)`
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
  ): Promise<readonly EstimationNombre[]> => {
    const query = sql.type(estimationNombreSchema)`
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
  ): Promise<EstimationNombre> => {
    const query = sql.type(estimationNombreSchema)`
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

  const deleteEstimationNombreById = async (estimationnombreId: number): Promise<EstimationNombre> => {
    const query = sql.type(estimationNombreSchema)`
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
