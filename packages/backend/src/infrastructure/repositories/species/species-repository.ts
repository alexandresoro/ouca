import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import {
  type Species,
  type SpeciesCreateInput,
  type SpeciesFindManyInput,
  speciesSchema,
} from "@domain/species/species.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import escapeStringRegexp from "escape-string-regexp";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";
import { withSearchCriteria } from "../search-criteria.js";
import { reshapeRawSpecies, reshapeRawSpeciesWithClassLabel } from "./species-repository-reshape.js";

export const buildSpeciesRepository = () => {
  const findSpeciesById = async (id: number): Promise<Species | null> => {
    const speciesResult = await kysely
      .selectFrom("espece")
      .select([
        sql<string>`id::text`.as("id"),
        "code",
        "nomFrancais",
        "nomLatin",
        sql<string>`classe_id::text`.as("classeId"),
        "ownerId",
      ])
      .where("id", "=", id)
      .executeTakeFirst();

    return speciesResult ? speciesSchema.parse(reshapeRawSpecies(speciesResult)) : null;
  };

  const findSpeciesByEntryId = async (entryId: string | undefined): Promise<Species | null> => {
    if (!entryId) {
      return null;
    }

    const speciesResult = await kysely
      .selectFrom("espece")
      .leftJoin("donnee", "espece.id", "donnee.especeId")
      .select([
        sql<string>`espece.id::text`.as("id"),
        "espece.code",
        "espece.nomFrancais",
        "espece.nomLatin",
        sql<string>`espece.classe_id::text`.as("classeId"),
        "espece.ownerId",
      ])
      .where("donnee.id", "=", Number.parseInt(entryId))
      .executeTakeFirst();

    return speciesResult ? speciesSchema.parse(reshapeRawSpecies(speciesResult)) : null;
  };

  const findAllSpeciesWithClassLabel = async (): Promise<(Species & { classLabel: string })[]> => {
    const speciesWithClassLabel = await kysely
      .selectFrom("espece")
      .leftJoin("classe", "espece.classeId", "classe.id")
      .select([
        sql<string>`espece.id::text`.as("id"),
        "espece.code",
        "espece.nomFrancais",
        "espece.nomLatin",
        sql<string>`espece.classe_id::text`.as("classeId"),
        "espece.ownerId",
        "classe.libelle as classLabel",
      ])
      .execute();

    return z
      .array(speciesSchema.extend({ classLabel: z.string() }))
      .parse(
        speciesWithClassLabel.map((oneSpeciesWithClassLabel) =>
          reshapeRawSpeciesWithClassLabel(oneSpeciesWithClassLabel),
        ),
      );
  };

  const findSpecies = async ({
    orderBy,
    sortOrder,
    q,
    searchCriteria,
    offset,
    limit,
  }: SpeciesFindManyInput = {}): Promise<Species[]> => {
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let querySpecies;

    switch (orderBy) {
      case "nbDonnees":
        querySpecies = kysely
          .selectFrom("espece")
          .leftJoin("classe", "espece.classeId", "classe.id")
          .leftJoin("donnee", "donnee.especeId", "espece.id")
          .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
          .leftJoin("comportement", "donnee_comportement.comportementId", "comportement.id")
          .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
          .leftJoin("milieu", "donnee_milieu.milieuId", "milieu.id")
          .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
          .leftJoin("lieudit", "inventaire.lieuditId", "lieudit.id")
          .leftJoin("commune", "lieudit.communeId", "commune.id")
          .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
          .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
          .select([
            sql<string>`espece.id::text`.as("id"),
            "espece.code",
            "espece.nomFrancais",
            "espece.nomLatin",
            sql<string>`espece.classe_id::text`.as("classeId"),
            "espece.ownerId",
          ]);

        if (q?.length) {
          querySpecies = querySpecies.where((eb) =>
            eb.or([
              eb("espece.code", "~*", sql<string>`${escapeStringRegexp(q)}`),
              eb(sql`unaccent(espece.nom_francais)`, "~*", sql`unaccent(${escapeStringRegexp(q)}})`),
              eb(sql`unaccent(espece.nom_latin)`, "~*", sql`unaccent(${escapeStringRegexp(q)}})`),
            ]),
          );
        }

        if (searchCriteria != null) {
          querySpecies = querySpecies.where(withSearchCriteria(searchCriteria));
        }

        querySpecies = querySpecies
          .groupBy("espece.id")
          .orderBy((eb) => eb.fn.count("donnee.id"), sortOrder ?? undefined)
          .orderBy("espece.code asc");

        break;
      case "nomClasse":
        querySpecies = kysely
          .selectFrom("espece")
          .leftJoin("classe", "espece.classeId", "classe.id")
          .leftJoin("donnee", "donnee.especeId", "espece.id")
          .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
          .leftJoin("comportement", "donnee_comportement.comportementId", "comportement.id")
          .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
          .leftJoin("milieu", "donnee_milieu.milieuId", "milieu.id")
          .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
          .leftJoin("lieudit", "inventaire.lieuditId", "lieudit.id")
          .leftJoin("commune", "lieudit.communeId", "commune.id")
          .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
          .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
          .select([
            sql<string>`espece.id::text`.as("id"),
            "espece.code",
            "espece.nomFrancais",
            "espece.nomLatin",
            sql<string>`espece.classe_id::text`.as("classeId"),
            "espece.ownerId",
          ]);

        if (q?.length) {
          querySpecies = querySpecies.where((eb) =>
            eb.or([
              eb("espece.code", "~*", sql<string>`${escapeStringRegexp(q)}`),
              eb(sql`unaccent(espece.nom_francais)`, "~*", sql`unaccent(${escapeStringRegexp(q)}})`),
              eb(sql`unaccent(espece.nom_latin)`, "~*", sql`unaccent(${escapeStringRegexp(q)}})`),
            ]),
          );
        }

        if (searchCriteria != null) {
          querySpecies = querySpecies.where(withSearchCriteria(searchCriteria));
        }

        querySpecies = querySpecies.orderBy("classe.libelle", sortOrder ?? undefined).orderBy("espece.code asc");

        break;
      default:
        querySpecies = kysely
          .selectFrom("espece")
          .leftJoin("classe", "espece.classeId", "classe.id")
          .leftJoin("donnee", "donnee.especeId", "espece.id")
          .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
          .leftJoin("comportement", "donnee_comportement.comportementId", "comportement.id")
          .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
          .leftJoin("milieu", "donnee_milieu.milieuId", "milieu.id")
          .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
          .leftJoin("lieudit", "inventaire.lieuditId", "lieudit.id")
          .leftJoin("commune", "lieudit.communeId", "commune.id")
          .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
          .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
          .select([
            sql<string>`espece.id::text`.as("id"),
            "espece.code",
            "espece.nomFrancais",
            "espece.nomLatin",
            sql<string>`espece.classe_id::text`.as("classeId"),
            "espece.ownerId",
          ]);

        if (q?.length) {
          querySpecies = querySpecies.where((eb) =>
            eb.or([
              eb("espece.code", "~*", sql<string>`${escapeStringRegexp(q)}`),
              eb(sql`unaccent(espece.nom_francais)`, "~*", sql`unaccent(${escapeStringRegexp(q)}})`),
              eb(sql`unaccent(espece.nom_latin)`, "~*", sql`unaccent(${escapeStringRegexp(q)}})`),
            ]),
          );
        }

        if (searchCriteria != null) {
          querySpecies = querySpecies.where(withSearchCriteria(searchCriteria));
        }

        if (orderBy) {
          querySpecies = querySpecies.orderBy(orderBy, sortOrder ?? undefined);
        } else {
          // If no explicit order is requested and a query is provided, return the matches in the following order:
          // The ones for which code starts with query
          // Then the ones which code contains the query
          if (q?.length) {
            querySpecies = querySpecies
              .orderBy(sql`espece.code ~* ${`^${escapeStringRegexp(q)}`}`, "desc")
              .orderBy(sql`espece.code ~* ${`${escapeStringRegexp(q)}`}`, "desc");
          }

          // Finally the ones that don't match the code (i.e. nom francais or latin) sorted by code
          querySpecies = querySpecies.orderBy("espece.code asc");
        }

        break;
    }

    if (offset) {
      querySpecies = querySpecies.offset(offset);
    }
    if (limit) {
      querySpecies = querySpecies.limit(limit);
    }

    const speciesResult = await querySpecies.execute();

    return z.array(speciesSchema).parse(speciesResult.map((species) => reshapeRawSpecies(species)));
  };

  const getCount = async ({
    q,
    searchCriteria,
  }: Pick<SpeciesFindManyInput, "q" | "searchCriteria">): Promise<number> => {
    let query = kysely
      .selectFrom("espece")
      .leftJoin("classe", "espece.classeId", "classe.id")
      .leftJoin("donnee", "donnee.especeId", "espece.id")
      .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
      .leftJoin("comportement", "donnee_comportement.comportementId", "comportement.id")
      .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
      .leftJoin("milieu", "donnee_milieu.milieuId", "milieu.id")
      .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
      .leftJoin("lieudit", "inventaire.lieuditId", "lieudit.id")
      .leftJoin("commune", "lieudit.communeId", "commune.id")
      .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
      .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
      .select((eb) => eb.fn.count("espece.id").distinct().as("count"));

    if (q?.length) {
      query = query.where((eb) =>
        eb.or([
          eb("espece.code", "~*", sql<string>`${escapeStringRegexp(q)}`),
          eb(sql`unaccent(espece.nom_francais)`, "~*", sql`unaccent(${escapeStringRegexp(q)}})`),
          eb(sql`unaccent(espece.nom_latin)`, "~*", sql`unaccent(${escapeStringRegexp(q)}})`),
        ]),
      );
    }

    if (searchCriteria != null) {
      query = query.where(withSearchCriteria(searchCriteria));
    }

    const countResult = await query.executeTakeFirstOrThrow();

    return countSchema.parse(countResult).count;
  };

  const createSpecies = async (speciesInput: SpeciesCreateInput): Promise<Result<Species, EntityFailureReason>> => {
    return fromPromise(
      kysely
        .insertInto("espece")
        .values({
          code: speciesInput.code,
          nomFrancais: speciesInput.nomFrancais,
          nomLatin: speciesInput.nomLatin,
          classeId: Number.parseInt(speciesInput.classId),
          ownerId: speciesInput.ownerId,
        })
        .returning([
          sql<string>`id::text`.as("id"),
          "code",
          "nomFrancais",
          "nomLatin",
          sql<string>`classe_id::text`.as("classeId"),
          "ownerId",
        ])
        .executeTakeFirstOrThrow(),
      handleDatabaseError,
    ).map((createdSpecies) => speciesSchema.parse(reshapeRawSpecies(createdSpecies)));
  };

  const createSpeciesMultiple = async (speciesInputs: SpeciesCreateInput[]): Promise<Species[]> => {
    const createdSpecies = await kysely
      .insertInto("espece")
      .values(
        speciesInputs.map((speciesInput) => ({
          code: speciesInput.code,
          nomFrancais: speciesInput.nomFrancais,
          nomLatin: speciesInput.nomLatin,
          classeId: Number.parseInt(speciesInput.classId),
          ownerId: speciesInput.ownerId,
        })),
      )
      .returning([
        sql<string>`id::text`.as("id"),
        "code",
        "nomFrancais",
        "nomLatin",
        sql<string>`classe_id::text`.as("classeId"),
        "ownerId",
      ])
      .execute();

    return z
      .array(speciesSchema)
      .nonempty()
      .parse(createdSpecies.map((oneCreatedSpecies) => reshapeRawSpecies(oneCreatedSpecies)));
  };

  const updateSpecies = async (
    speciesId: number,
    speciesInput: SpeciesCreateInput,
  ): Promise<Result<Species, EntityFailureReason>> => {
    return fromPromise(
      kysely
        .updateTable("espece")
        .set({
          code: speciesInput.code,
          nomFrancais: speciesInput.nomFrancais,
          nomLatin: speciesInput.nomLatin,
          classeId: Number.parseInt(speciesInput.classId),
          ownerId: speciesInput.ownerId,
        })
        .where("id", "=", speciesId)
        .returning([
          sql<string>`id::text`.as("id"),
          "code",
          "nomFrancais",
          "nomLatin",
          sql<string>`classe_id::text`.as("classeId"),
          "ownerId",
        ])
        .executeTakeFirstOrThrow(),
      handleDatabaseError,
    ).map((updatedSpecies) => speciesSchema.parse(reshapeRawSpecies(updatedSpecies)));
  };

  const deleteSpeciesById = async (speciesId: number): Promise<Species | null> => {
    const deletedSpecies = await kysely
      .deleteFrom("espece")
      .where("id", "=", speciesId)
      .returning([
        sql<string>`id::text`.as("id"),
        "code",
        "nomFrancais",
        "nomLatin",
        sql<string>`classe_id::text`.as("classeId"),
        "ownerId",
      ])
      .executeTakeFirst();

    return deletedSpecies ? speciesSchema.parse(reshapeRawSpecies(deletedSpecies)) : null;
  };

  return {
    findSpeciesById,
    findSpeciesByEntryId,
    findAllSpeciesWithClassLabel,
    findSpecies,
    getCount,
    createSpecies,
    createSpeciesMultiple,
    updateSpecies,
    deleteSpeciesById,
  };
};