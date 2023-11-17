import { ageSchema, type Age, type AgeCreateInput, type AgeFindManyInput } from "@domain/age/age.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql as sqlKysely } from "kysely";
import { sql, type DatabasePool } from "slonik";
import { z } from "zod";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectToKeyValueSet,
} from "../../../repositories/repository-helpers.js";
import { countSchema } from "../common.js";

export type AgeRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildAgeRepository = ({ slonik }: AgeRepositoryDependencies) => {
  const findAgeById = async (id: number): Promise<Age | null> => {
    const ageResult = await kysely
      .selectFrom("basenaturaliste.age")
      .select([sqlKysely<string>`id::text`.as("id"), "libelle", "ownerId"])
      .where("id", "=", id)
      .executeTakeFirst();

    return ageResult ? ageSchema.parse(ageResult) : null;
  };

  const findAgeByDonneeId = async (donneeId: number | undefined): Promise<Age | null> => {
    if (!donneeId) {
      return null;
    }

    const query = sql.type(ageSchema)`
      SELECT 
        age.id::text,
        age.libelle,
        age.owner_id
      FROM
        basenaturaliste.age
      LEFT JOIN basenaturaliste.donnee ON age.id = donnee.age_id
      WHERE
        donnee.id = ${donneeId}
    `;

    return slonik.maybeOne(query);
  };

  const findAges = async ({ orderBy, sortOrder, q, offset, limit }: AgeFindManyInput = {}): Promise<readonly Age[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(ageSchema)`
      SELECT 
        age.id::text,
        age.libelle,
        age.owner_id
      FROM
        basenaturaliste.age
      ${isSortByNbDonnees ? sql.fragment`LEFT JOIN basenaturaliste.donnee ON age.id = donnee.age_id` : sql.fragment``}
      ${
        libelleLike
          ? sql.fragment`
      WHERE unaccent(libelle) ILIKE unaccent(${libelleLike})
      `
          : sql.fragment``
      }
      ${isSortByNbDonnees ? sql.fragment`GROUP BY age."id"` : sql.fragment``}
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
    let query = kysely.selectFrom("basenaturaliste.age").select((eb) => eb.fn.countAll().as("count"));

    if (q?.length) {
      query = query.where(sqlKysely`unaccent(libelle)`, "ilike", sqlKysely`unaccent(${`%${q}%`})`);
    }

    const countResult = await query.executeTakeFirstOrThrow();

    return countSchema.parse(countResult).count;
  };

  const createAge = async (ageInput: AgeCreateInput): Promise<Age> => {
    const createdAge = await kysely
      .insertInto("basenaturaliste.age")
      .values({
        libelle: ageInput.libelle,
        ownerId: ageInput.ownerId,
      })
      .returning([sqlKysely<string>`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow();

    return ageSchema.parse(createdAge);
  };

  const createAges = async (ageInputs: AgeCreateInput[]): Promise<Age[]> => {
    const createdAges = await kysely
      .insertInto("basenaturaliste.age")
      .values(
        ageInputs.map((ageInput) => {
          return {
            libelle: ageInput.libelle,
            ownerId: ageInput.ownerId,
          };
        })
      )
      .returning([sqlKysely<string>`id::text`.as("id"), "libelle", "ownerId"])
      .execute();

    return z.array(ageSchema).nonempty().parse(createdAges);
  };

  const updateAge = async (ageId: number, ageInput: AgeCreateInput): Promise<Age> => {
    const query = sql.type(ageSchema)`
      UPDATE
        basenaturaliste.age
      SET
        ${objectToKeyValueSet(ageInput)}
      WHERE
        id = ${ageId}
      RETURNING
        age.id::text,
        age.libelle,
        age.owner_id
    `;

    return slonik.one(query);
  };

  const deleteAgeById = async (ageId: number): Promise<Age | null> => {
    const deletedAge = await kysely
      .deleteFrom("basenaturaliste.age")
      .where("id", "=", ageId)
      .returning([sqlKysely<string>`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirst();

    return deletedAge ? ageSchema.parse(deletedAge) : null;
  };

  return {
    findAgeById,
    findAgeByDonneeId,
    findAges,
    getCount,
    createAge,
    createAges,
    updateAge,
    deleteAgeById,
  };
};

export type AgeRepository = ReturnType<typeof buildAgeRepository>;
