import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common.js";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectToKeyValueInsert,
  objectToKeyValueSet,
  objectsToKeyValueInsert
} from "../repository-helpers.js";
import {
  estimationDistanceSchema,
  type EstimationDistance,
  type EstimationDistanceCreateInput,
  type EstimationDistanceFindManyInput
} from "./estimation-distance-repository-types.js";

export type EstimationDistanceRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildEstimationDistanceRepository = ({ slonik }: EstimationDistanceRepositoryDependencies) => {
  const findEstimationDistanceById = async (id: number): Promise<EstimationDistance | null> => {
    const query = sql.type(estimationDistanceSchema)`
      SELECT 
        estimation_distance.id::text,
        estimation_distance.libelle,
        estimation_distance.owner_id
      FROM
        basenaturaliste.estimation_distance
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findEstimationDistanceByDonneeId = async (donneeId: number | undefined): Promise<EstimationDistance | null> => {
    if (!donneeId) {
      return null;
    }

    const query = sql.type(estimationDistanceSchema)`
      SELECT 
        estimation_distance.id::text,
        estimation_distance.libelle,
        estimation_distance.owner_id
      FROM
        basenaturaliste.estimation_distance
      LEFT JOIN basenaturaliste.donnee ON estimation_distance.id = donnee.estimation_distance_id
      WHERE
        donnee.id = ${donneeId}
    `;

    return slonik.maybeOne(query);
  };

  const findEstimationsDistance = async ({
    orderBy,
    sortOrder,
    q,
    offset,
    limit,
  }: EstimationDistanceFindManyInput = {}): Promise<readonly EstimationDistance[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(estimationDistanceSchema)`
      SELECT 
        estimation_distance.id::text,
        estimation_distance.libelle,
        estimation_distance.owner_id
      FROM
        basenaturaliste.estimation_distance
      ${
        isSortByNbDonnees
          ? sql.fragment`LEFT JOIN basenaturaliste.donnee ON estimation_distance.id = donnee.estimation_distance_id`
          : sql.fragment``
      }
      ${
        libelleLike
          ? sql.fragment`
      WHERE unaccent(libelle) ILIKE unaccent(${libelleLike})
      `
          : sql.fragment``
      }
      ${isSortByNbDonnees ? sql.fragment`GROUP BY estimation_distance."id"` : sql.fragment``}
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
        basenaturaliste.estimation_distance
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

  const createEstimationDistance = async (
    estimationdistanceInput: EstimationDistanceCreateInput
  ): Promise<EstimationDistance> => {
    const query = sql.type(estimationDistanceSchema)`
      INSERT INTO
        basenaturaliste.estimation_distance
        ${objectToKeyValueInsert(estimationdistanceInput)}
      RETURNING
        estimation_distance.id::text,
        estimation_distance.libelle,
        estimation_distance.owner_id
    `;

    return slonik.one(query);
  };

  const createEstimationsDistance = async (
    estimationdistanceInputs: EstimationDistanceCreateInput[]
  ): Promise<readonly EstimationDistance[]> => {
    const query = sql.type(estimationDistanceSchema)`
      INSERT INTO
        basenaturaliste.estimation_distance
        ${objectsToKeyValueInsert(estimationdistanceInputs)}
      RETURNING
        estimation_distance.id::text,
        estimation_distance.libelle,
        estimation_distance.owner_id
    `;

    return slonik.many(query);
  };

  const updateEstimationDistance = async (
    estimationdistanceId: number,
    estimationdistanceInput: EstimationDistanceCreateInput
  ): Promise<EstimationDistance> => {
    const query = sql.type(estimationDistanceSchema)`
      UPDATE
        basenaturaliste.estimation_distance
      SET
        ${objectToKeyValueSet(estimationdistanceInput)}
      WHERE
        id = ${estimationdistanceId}
      RETURNING
        estimation_distance.id::text,
        estimation_distance.libelle,
        estimation_distance.owner_id
    `;

    return slonik.one(query);
  };

  const deleteEstimationDistanceById = async (estimationdistanceId: number): Promise<EstimationDistance> => {
    const query = sql.type(estimationDistanceSchema)`
      DELETE
      FROM
        basenaturaliste.estimation_distance
      WHERE
        id = ${estimationdistanceId}
      RETURNING
        estimation_distance.id::text,
        estimation_distance.libelle,
        estimation_distance.owner_id
    `;

    return slonik.one(query);
  };

  return {
    findEstimationDistanceById,
    findEstimationDistanceByDonneeId,
    findEstimationsDistance,
    getCount,
    createEstimationDistance,
    createEstimationsDistance,
    updateEstimationDistance,
    deleteEstimationDistanceById,
  };
};

export type EstimationDistanceRepository = ReturnType<typeof buildEstimationDistanceRepository>;
