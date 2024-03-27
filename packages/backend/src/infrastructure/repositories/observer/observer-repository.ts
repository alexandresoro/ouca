import {
  type Observer,
  type ObserverCreateInput,
  type ObserverFindManyInput,
  type ObserverSimple,
  observerSchema,
  observerSimpleSchema,
} from "@domain/observer/observer.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import escapeStringRegexp from "escape-string-regexp";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

const findObserverById = async (id: number): Promise<Observer | null> => {
  const observerResult = await kysely
    .selectFrom("observateur")
    .leftJoin("inventaire", "inventaire.observateurId", "observateur.id")
    .leftJoin("donnee", "donnee.inventaireId", "inventaire.id")
    .select([sql<string>`basenaturaliste.observateur.id::text`.as("id"), "libelle", "observateur.ownerId"])
    .select((eb) => eb.fn.count("inventaire.id").distinct().as("inventoriesCount"))
    .select((eb) => eb.fn.count("donnee.id").distinct().as("entriesCount"))
    .where("observateur.id", "=", id)
    .groupBy("observateur.id")
    .executeTakeFirst();

  return observerResult ? observerSchema.parse(observerResult) : null;
};

const findObserversById = async (ids: string[]): Promise<Observer[]> => {
  const observersResult = await kysely
    .selectFrom("observateur")
    .leftJoin("inventaire", "inventaire.observateurId", "observateur.id")
    .leftJoin("donnee", "donnee.inventaireId", "inventaire.id")
    .select([sql<string>`basenaturaliste.observateur.id::text`.as("id"), "libelle", "observateur.ownerId"])
    .select((eb) => eb.fn.count("inventaire.id").distinct().as("inventoriesCount"))
    .select((eb) => eb.fn.count("donnee.id").distinct().as("entriesCount"))
    .where(
      "observateur.id",
      "in",
      ids.map((id) => Number.parseInt(id)),
    )
    .groupBy("observateur.id")
    .execute();

  return z.array(observerSchema).parse(observersResult);
};

const findObservers = async ({
  orderBy,
  sortOrder,
  q,
  offset,
  limit,
}: ObserverFindManyInput = {}): Promise<readonly ObserverSimple[]> => {
  const isSortByNbDonnees = orderBy === "nbDonnees";

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let queryObs;
  if (isSortByNbDonnees) {
    queryObs = kysely
      .selectFrom("observateur")
      .leftJoin("inventaire", "inventaire.observateurId", "observateur.id")
      .leftJoin("donnee", "donnee.inventaireId", "inventaire.id")
      .select([sql`basenaturaliste.observateur.id::text`.as("id"), "libelle", "observateur.ownerId"]);

    if (q?.length) {
      queryObs = queryObs.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    queryObs = queryObs
      .groupBy("observateur.id")
      .orderBy((eb) => eb.fn.count("donnee.id"), sortOrder ?? undefined)
      .orderBy("observateur.libelle asc");
  } else {
    queryObs = kysely
      .selectFrom("observateur")
      .select([sql`basenaturaliste.observateur.id::text`.as("id"), "libelle", "observateur.ownerId"]);

    if (q?.length) {
      queryObs = queryObs.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    if (orderBy) {
      queryObs = queryObs.orderBy(orderBy, sortOrder ?? undefined);
    } else if (q) {
      // If no explicit order is requested and a query is provided, return the matches in the following order:
      // The ones for which libelle starts with query
      // Then the ones which libelle contains the query
      // Then two groups are finally sorted alphabetically
      queryObs = queryObs
        .orderBy(sql`"basenaturaliste"."observateur"."libelle" ~* ${`^${escapeStringRegexp(q)}`}`, "desc")
        .orderBy("libelle", "asc");
    }
  }

  if (offset) {
    queryObs = queryObs.offset(offset);
  }
  if (limit) {
    queryObs = queryObs.limit(limit);
  }

  const observersResult = await queryObs.execute();

  return z.array(observerSimpleSchema).parse(observersResult);
};

const getCount = async (q?: string | null): Promise<number> => {
  let query = kysely.selectFrom("observateur").select((eb) => eb.fn.countAll().as("count"));

  if (q?.length) {
    query = query.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
  }

  const countResult = await query.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createObserver = async (observerInput: ObserverCreateInput): Promise<Result<Observer, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("observateur")
      .values({
        libelle: observerInput.libelle,
        ownerId: observerInput.ownerId,
      })
      .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdObserver) => observerSchema.parse({ ...createdObserver, inventoriesCount: 0, entriesCount: 0 }));
};

const createObservers = async (observerInputs: ObserverCreateInput[]): Promise<ObserverSimple[]> => {
  const createdObservers = await kysely
    .insertInto("observateur")
    .values(
      observerInputs.map((observerInput) => {
        return {
          libelle: observerInput.libelle,
          ownerId: observerInput.ownerId,
        };
      }),
    )
    .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
    .execute();

  return z.array(observerSimpleSchema).nonempty().parse(createdObservers);
};

const updateObserver = async (
  observateurId: number,
  observateurInput: ObserverCreateInput,
): Promise<Result<Observer, EntityFailureReason>> => {
  return fromPromise(
    kysely.transaction().execute(async (trx) => {
      // Update observer
      const updatedObserver = await trx
        .updateTable("observateur")
        .set({
          libelle: observateurInput.libelle,
          ownerId: observateurInput.ownerId,
        })
        .where("id", "=", observateurId)
        .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
        .executeTakeFirstOrThrow();

      // Compute counts
      const { inventoriesCount, entriesCount } = await trx
        .selectFrom("observateur")
        .leftJoin("inventaire", "inventaire.observateurId", "observateur.id")
        .leftJoin("donnee", "donnee.inventaireId", "inventaire.id")
        .select((eb) => eb.fn.count("inventaire.id").distinct().as("inventoriesCount"))
        .select((eb) => eb.fn.count("donnee.id").distinct().as("entriesCount"))
        .where("observateur.id", "=", observateurId)
        .groupBy("observateur.id")
        .executeTakeFirstOrThrow();

      return {
        ...updatedObserver,
        inventoriesCount,
        entriesCount,
      };
    }),
    handleDatabaseError,
  ).map((updatedObserver) => {
    return observerSchema.parse(updatedObserver);
  });
};

const deleteObserverById = async (observerId: number): Promise<ObserverSimple | null> => {
  const deletedObserver = await kysely
    .deleteFrom("observateur")
    .where("id", "=", observerId)
    .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
    .executeTakeFirst();

  return deletedObserver ? observerSimpleSchema.parse(deletedObserver) : null;
};

export const observerRepository = {
  findObserverById,
  findObserversById,
  findObservers,
  getCount,
  createObserver,
  createObservers,
  updateObserver,
  deleteObserverById,
};
