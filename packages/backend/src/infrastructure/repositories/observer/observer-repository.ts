import {
  observerSchema,
  observerSimpleSchema,
  type Observer,
  type ObserverCreateInput,
  type ObserverFindManyInput,
  type ObserverSimple,
} from "@domain/observer/observer.js";
import { type EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql as sqlKysely } from "kysely";
import { fromPromise, type Result } from "neverthrow";
import { sql, type DatabasePool } from "slonik";
import { z } from "zod";
import { buildPaginationFragment, buildSortOrderFragment } from "../../../repositories/repository-helpers.js";
import { countSchema } from "../common.js";

export type ObservateurRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildObserverRepository = ({ slonik }: ObservateurRepositoryDependencies) => {
  const findObserverById = async (id: number): Promise<Observer | null> => {
    const observerResult = await kysely
      .selectFrom("basenaturaliste.observateur")
      .leftJoin(
        "basenaturaliste.inventaire",
        "basenaturaliste.inventaire.observateurId",
        "basenaturaliste.observateur.id"
      )
      .leftJoin("basenaturaliste.donnee", "basenaturaliste.donnee.inventaireId", "basenaturaliste.inventaire.id")
      .select([
        sqlKysely<string>`basenaturaliste.observateur.id::text`.as("id"),
        "libelle",
        "basenaturaliste.observateur.ownerId",
      ])
      .select((eb) => eb.fn.count("basenaturaliste.inventaire.id").distinct().as("inventoriesCount"))
      .select((eb) => eb.fn.count("basenaturaliste.donnee.id").distinct().as("entriesCount"))
      .where("basenaturaliste.observateur.id", "=", id)
      .groupBy("basenaturaliste.observateur.id")
      .executeTakeFirst();

    return observerResult ? observerSchema.parse(observerResult) : null;
  };

  const findObserverByInventoryId = async (inventaireId: number | undefined): Promise<ObserverSimple | null> => {
    if (!inventaireId) {
      return null;
    }

    const query = sql.type(observerSimpleSchema)`
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

  const findAssociatesOfInventoryId = async (inventaireId: number | undefined): Promise<ObserverSimple[]> => {
    if (!inventaireId) {
      return [];
    }

    const query = sql.type(observerSimpleSchema)`
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

    const associates = await slonik.any(query);

    return [...associates];
  };

  const findObservers = async ({
    orderBy,
    sortOrder,
    q,
    offset,
    limit,
  }: ObserverFindManyInput = {}): Promise<readonly ObserverSimple[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    // If no explicit order is requested and a query is provided, return the matches in the following order:
    // The ones for which libelle starts with query
    // Then the ones which libelle contains the query
    // Then two groups are finally sorted alphabetically
    const matchStartLibelle = q ? `^${q}` : null;
    const query = sql.type(observerSimpleSchema)`
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

  const createObserver = async (observerInput: ObserverCreateInput): Promise<Result<Observer, EntityFailureReason>> => {
    return fromPromise(
      kysely
        .insertInto("basenaturaliste.observateur")
        .values({
          libelle: observerInput.libelle,
          ownerId: observerInput.ownerId,
        })
        .returning([sqlKysely<string>`id::text`.as("id"), "libelle", "ownerId"])
        .executeTakeFirstOrThrow(),
      handleDatabaseError
    ).map((createdObserver) => observerSchema.parse({ ...createdObserver, inventoriesCount: 0, entriesCount: 0 }));
  };

  const createObservers = async (observerInputs: ObserverCreateInput[]): Promise<ObserverSimple[]> => {
    const createdObservers = await kysely
      .insertInto("basenaturaliste.observateur")
      .values(
        observerInputs.map((observerInput) => {
          return {
            libelle: observerInput.libelle,
            ownerId: observerInput.ownerId,
          };
        })
      )
      .returning([sqlKysely<string>`id::text`.as("id"), "libelle", "ownerId"])
      .execute();

    return z.array(observerSimpleSchema).nonempty().parse(createdObservers);
  };

  const updateObserver = async (
    observateurId: number,
    observateurInput: ObserverCreateInput
  ): Promise<Result<Observer, EntityFailureReason>> => {
    return fromPromise(
      kysely.transaction().execute(async (trx) => {
        // Update observer
        const updatedObserver = await trx
          .updateTable("basenaturaliste.observateur")
          .set({
            libelle: observateurInput.libelle,
            ownerId: observateurInput.ownerId,
          })
          .where("id", "=", observateurId)
          .returning([sqlKysely<string>`id::text`.as("id"), "libelle", "ownerId"])
          .executeTakeFirstOrThrow();

        // Compute counts
        const { inventoriesCount, entriesCount } = await trx
          .selectFrom("basenaturaliste.observateur")
          .leftJoin(
            "basenaturaliste.inventaire",
            "basenaturaliste.inventaire.observateurId",
            "basenaturaliste.observateur.id"
          )
          .leftJoin("basenaturaliste.donnee", "basenaturaliste.donnee.inventaireId", "basenaturaliste.inventaire.id")
          .select((eb) => eb.fn.count("basenaturaliste.inventaire.id").distinct().as("inventoriesCount"))
          .select((eb) => eb.fn.count("basenaturaliste.donnee.id").distinct().as("entriesCount"))
          .where("basenaturaliste.observateur.id", "=", observateurId)
          .groupBy("basenaturaliste.observateur.id")
          .executeTakeFirstOrThrow();

        return {
          ...updatedObserver,
          inventoriesCount,
          entriesCount,
        };
      }),
      handleDatabaseError
    ).map((updatedObserver) => {
      return observerSchema.parse(updatedObserver);
    });
  };

  const deleteObserverById = async (observerId: number): Promise<ObserverSimple | null> => {
    const deletedObserver = await kysely
      .deleteFrom("basenaturaliste.observateur")
      .where("id", "=", observerId)
      .returning([sqlKysely<string>`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirst();

    return deletedObserver ? observerSimpleSchema.parse(deletedObserver) : null;
  };

  return {
    findObserverById,
    findObserverByInventoryId,
    findAssociatesOfInventoryId,
    findObservers,
    getCount,
    createObserver,
    createObservers,
    updateObserver,
    deleteObserverById,
  };
};

export type ObserverRepository = ReturnType<typeof buildObserverRepository>;
