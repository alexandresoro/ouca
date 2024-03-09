import { type Age, type AgeCreateInput, type AgeFindManyInput, ageSchema } from "@domain/age/age.js";
import { type EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

export const buildAgeRepository = () => {
  const findAgeById = async (id: number): Promise<Age | null> => {
    const ageResult = await kysely
      .selectFrom("age")
      .select([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
      .where("id", "=", id)
      .executeTakeFirst();

    return ageResult ? ageSchema.parse(ageResult) : null;
  };

  const findAgeByEntryId = async (entryId: number | undefined): Promise<Age | null> => {
    if (!entryId) {
      return null;
    }

    const ageResult = await kysely
      .selectFrom("age")
      .leftJoin("donnee", "donnee.ageId", "age.id")
      .select([sql<string>`basenaturaliste.age.id::text`.as("id"), "libelle", "ownerId"])
      .where("donnee.id", "=", entryId)
      .executeTakeFirst();

    return ageResult ? ageSchema.parse(ageResult) : null;
  };

  const findAges = async ({ orderBy, sortOrder, q, offset, limit }: AgeFindManyInput = {}): Promise<readonly Age[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";

    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let queryAge;

    if (isSortByNbDonnees) {
      queryAge = kysely
        .selectFrom("age")
        .leftJoin("donnee", "donnee.ageId", "age.id")
        .select([sql`basenaturaliste.age.id::text`.as("id"), "libelle", "age.ownerId"]);

      if (q?.length) {
        queryAge = queryAge.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      queryAge = queryAge
        .groupBy("age.id")
        .orderBy((eb) => eb.fn.count("donnee.id"), sortOrder ?? undefined)
        .orderBy("age.libelle asc");
    } else {
      queryAge = kysely
        .selectFrom("age")
        .select([sql`basenaturaliste.age.id::text`.as("id"), "libelle", "age.ownerId"]);

      if (q?.length) {
        queryAge = queryAge.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      if (orderBy) {
        queryAge = queryAge.orderBy(orderBy, sortOrder ?? undefined);
      }
    }

    if (offset) {
      queryAge = queryAge.offset(offset);
    }
    if (limit) {
      queryAge = queryAge.limit(limit);
    }

    const agesResult = await queryAge.execute();

    return z.array(ageSchema).parse(agesResult);
  };

  const getCount = async (q?: string | null): Promise<number> => {
    let query = kysely.selectFrom("age").select((eb) => eb.fn.countAll().as("count"));

    if (q?.length) {
      query = query.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    const countResult = await query.executeTakeFirstOrThrow();

    return countSchema.parse(countResult).count;
  };

  const createAge = async (ageInput: AgeCreateInput): Promise<Result<Age, EntityFailureReason>> => {
    return fromPromise(
      kysely
        .insertInto("age")
        .values({
          libelle: ageInput.libelle,
          ownerId: ageInput.ownerId,
        })
        .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
        .executeTakeFirstOrThrow(),
      handleDatabaseError
    ).map((createdAge) => ageSchema.parse(createdAge));
  };

  const createAges = async (ageInputs: AgeCreateInput[]): Promise<Age[]> => {
    const createdAges = await kysely
      .insertInto("age")
      .values(
        ageInputs.map((ageInput) => {
          return {
            libelle: ageInput.libelle,
            ownerId: ageInput.ownerId,
          };
        })
      )
      .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
      .execute();

    return z.array(ageSchema).nonempty().parse(createdAges);
  };

  const updateAge = async (ageId: number, ageInput: AgeCreateInput): Promise<Result<Age, EntityFailureReason>> => {
    return fromPromise(
      kysely
        .updateTable("age")
        .set({
          libelle: ageInput.libelle,
          ownerId: ageInput.ownerId,
        })
        .where("id", "=", ageId)
        .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
        .executeTakeFirstOrThrow(),
      handleDatabaseError
    ).map((updatedAge) => ageSchema.parse(updatedAge));
  };

  const deleteAgeById = async (ageId: number): Promise<Age | null> => {
    const deletedAge = await kysely
      .deleteFrom("age")
      .where("id", "=", ageId)
      .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirst();

    return deletedAge ? ageSchema.parse(deletedAge) : null;
  };

  return {
    findAgeById,
    findAgeByEntryId,
    findAges,
    getCount,
    createAge,
    createAges,
    updateAge,
    deleteAgeById,
  };
};

export type AgeRepository = ReturnType<typeof buildAgeRepository>;
