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
  observateurSchema,
  type Observateur,
  type ObservateurCreateInput,
  type ObservateurFindManyInput,
} from "./observateur-repository-types";

export type ObservateurRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildObservateurRepository = ({ slonik }: ObservateurRepositoryDependencies) => {
  const findObservateurById = async (id: number): Promise<Observateur | null> => {
    const query = sql.type(observateurSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.observateur
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findObservateurs = async ({ orderBy, sortOrder, q, offset, limit }: ObservateurFindManyInput = {}): Promise<
    readonly Observateur[]
  > => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(observateurSchema)`
    SELECT 
      observateur.*
    FROM
      basenaturaliste.observateur
    ${
      isSortByNbDonnees
        ? sql.fragment`
        LEFT JOIN basenaturaliste.inventaire ON observateur.id = inventaire.observateur_id
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
    ${isSortByNbDonnees ? sql.fragment`GROUP BY observateur."id"` : sql.fragment``}
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
        basenaturaliste.observateur
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

  const createObservateur = async (observateurInput: ObservateurCreateInput): Promise<Observateur> => {
    const query = sql.type(observateurSchema)`
      INSERT INTO
        basenaturaliste.observateur
        ${objectToKeyValueInsert(observateurInput)}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const createObservateurs = async (observateurInputs: ObservateurCreateInput[]): Promise<readonly Observateur[]> => {
    const query = sql.type(observateurSchema)`
      INSERT INTO
        basenaturaliste.observateur
        ${objectsToKeyValueInsert(observateurInputs)}
      RETURNING
        *
    `;

    return slonik.many(query);
  };

  const updateObservateur = async (
    observateurId: number,
    observateurInput: ObservateurCreateInput
  ): Promise<Observateur> => {
    const query = sql.type(observateurSchema)`
      UPDATE
        basenaturaliste.observateur
      SET
        ${objectToKeyValueSet(observateurInput)}
      WHERE
        id = ${observateurId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const deleteObservateurById = async (observateurId: number): Promise<Observateur> => {
    const query = sql.type(observateurSchema)`
      DELETE
      FROM
        basenaturaliste.observateur
      WHERE
        id = ${observateurId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  return {
    findObservateurById,
    findObservateurs,
    getCount,
    createObservateur,
    createObservateurs,
    updateObservateur,
    deleteObservateurById,
  };
};

export type ObservateurRepository = ReturnType<typeof buildObservateurRepository>;
