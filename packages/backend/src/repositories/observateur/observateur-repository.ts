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
  observateurSchema,
  type Observateur,
  type ObservateurCreateInput,
  type ObservateurFindManyInput,
} from "./observateur-repository-types.js";

export type ObservateurRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildObservateurRepository = ({ slonik }: ObservateurRepositoryDependencies) => {
  const findObservateurById = async (id: number): Promise<Observateur | null> => {
    const query = sql.type(observateurSchema)`
      SELECT 
        observateur.id::text,
        observateur.libelle,
        observateur.owner_id
      FROM
        basenaturaliste.observateur
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findObservateurByInventaireId = async (inventaireId: number | undefined): Promise<Observateur | null> => {
    if (!inventaireId) {
      return null;
    }

    const query = sql.type(observateurSchema)`
      SELECT 
        observateur.id::text,
        observateur.libelle,
        observateur.owner_id
      FROM
        basenaturaliste.observateur
      LEFT JOIN basenaturaliste.inventaire ON observateur.id = inventaire.observateur_id
      WHERE
        inventaire.id = ${inventaireId}
    `;

    return slonik.maybeOne(query);
  };

  const findAssociesOfInventaireId = async (inventaireId: number | undefined): Promise<readonly Observateur[]> => {
    if (!inventaireId) {
      return [];
    }

    const query = sql.type(observateurSchema)`
      SELECT 
        observateur.id::text,
        observateur.libelle,
        observateur.owner_id
      FROM
        basenaturaliste.observateur
      LEFT JOIN basenaturaliste.inventaire_associe ON observateur.id = inventaire_associe.observateur_id
      WHERE
      inventaire_associe.inventaire_id = ${inventaireId}
    `;

    return slonik.any(query);
  };

  const findObservateurs = async ({
    orderBy,
    sortOrder,
    q,
    offset,
    limit,
  }: ObservateurFindManyInput = {}): Promise<readonly Observateur[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    // If no explicit order is requested and a query is provided, return the matches in the following order:
    // The ones for which libelle starts with query
    // Then the ones which libelle contains the query
    // Then two groups are finally sorted alphabetically
    const matchStartLibelle = q ? `^${q}` : null;
    const query = sql.type(observateurSchema)`
    SELECT 
      observateur.id::text,
      observateur.libelle,
      observateur.owner_id
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
    WHERE unaccent(libelle) ILIKE unaccent(${libelleLike})
    `
        : sql.fragment``
    }
    ${isSortByNbDonnees ? sql.fragment`GROUP BY observateur."id"` : sql.fragment``}
    ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
    ${
      !orderBy && q
        ? sql.fragment`ORDER BY (observateur.libelle ~* ${matchStartLibelle}) DESC, observateur.libelle ASC`
        : sql.fragment``
    }
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
                unaccent(libelle) ILIKE unaccent(${libelleLike})
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
        observateur.id::text,
        observateur.libelle,
        observateur.owner_id
    `;

    return slonik.one(query);
  };

  const createObservateurs = async (observateurInputs: ObservateurCreateInput[]): Promise<readonly Observateur[]> => {
    const query = sql.type(observateurSchema)`
      INSERT INTO
        basenaturaliste.observateur
        ${objectsToKeyValueInsert(observateurInputs)}
      RETURNING
        observateur.id::text,
        observateur.libelle,
        observateur.owner_id
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
        observateur.id::text,
        observateur.libelle,
        observateur.owner_id
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
        observateur.id::text,
        observateur.libelle,
        observateur.owner_id
    `;

    return slonik.one(query);
  };

  return {
    findObservateurById,
    findObservateurByInventaireId,
    findAssociesOfInventaireId,
    findObservateurs,
    getCount,
    createObservateur,
    createObservateurs,
    updateObservateur,
    deleteObservateurById,
  };
};

export type ObservateurRepository = ReturnType<typeof buildObservateurRepository>;
