import { type Entry, type EntryCreateInput, entrySchema } from "@domain/entry/entry.js";
import type { SearchCriteria } from "@domain/search/search-criteria.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { countSchema } from "@infrastructure/repositories/common.js";
import { reshapeRawEntry } from "@infrastructure/repositories/entry/entry-repository-reshape.js";
import { withSearchCriteria } from "@infrastructure/repositories/search-criteria.js";
import { sql } from "kysely";

export const buildEntryRepository = () => {
  const findEntryById = async (id: string): Promise<Entry | null> => {
    const entryResult = await kysely
      .selectFrom("donnee")
      .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
      .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
      .select([
        sql<string>`donnee.id::text`.as("id"),
        sql<string>`donnee.inventaire_id::text`.as("inventaireId"),
        sql<string>`donnee.espece_id::text`.as("especeId"),
        sql<string>`donnee.sexe_id::text`.as("sexeId"),
        sql<string>`donnee.age_id::text`.as("ageId"),
        sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
        "nombre",
        sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
        "distance",
        "commentaire",
        "regroupement",
        "dateCreation",
        sql<string[]>`array_remove(array_agg(donnee_comportement.comportement_id::text), NULL)`.as("behaviorIds"),
        sql<string[]>`array_remove(array_agg(donnee_milieu.milieu_id::text), NULL)`.as("environmentIds"),
      ])
      .where("donnee.id", "=", Number.parseInt(id))
      .groupBy("donnee.id")
      .executeTakeFirst();

    return entryResult ? entrySchema.parse(reshapeRawEntry(entryResult)) : null;
  };

  const getCount = async (criteria?: SearchCriteria | null): Promise<number> => {
    let query = kysely
      .selectFrom("donnee")
      .leftJoin("espece", "donnee.especeId", "espece.id")
      .leftJoin("classe", "espece.classeId", "classe.id")
      .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
      .leftJoin("comportement", "donnee_comportement.comportementId", "comportement.id")
      .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
      .leftJoin("milieu", "donnee_milieu.milieuId", "milieu.id")
      .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
      .leftJoin("lieudit", "inventaire.lieuditId", "lieudit.id")
      .leftJoin("commune", "lieudit.communeId", "commune.id")
      .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
      .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
      .select((eb) => eb.fn.count("donnee.id").distinct().as("count"));

    if (criteria != null) {
      query = query.where(withSearchCriteria(criteria));
    }

    const countResult = await query.executeTakeFirstOrThrow();

    return countSchema.parse(countResult).count;
  };

  const createEntry = async (entryInput: EntryCreateInput): Promise<Entry> => {
    const createdEntry = await kysely.transaction().execute(async (trx) => {
      const entryResult = await trx
        .insertInto("donnee")
        .values({
          inventaireId: Number.parseInt(entryInput.inventoryId),
          especeId: Number.parseInt(entryInput.speciesId),
          sexeId: Number.parseInt(entryInput.sexId),
          ageId: Number.parseInt(entryInput.ageId),
          estimationNombreId: Number.parseInt(entryInput.numberEstimateId),
          nombre: entryInput.number,
          estimationDistanceId:
            entryInput.distanceEstimateId != null ? Number.parseInt(entryInput.distanceEstimateId) : null,
          distance: entryInput.distance,
          commentaire: entryInput.comment,
          regroupement: entryInput.grouping,
          dateCreation: new Date(),
        })
        .returning([
          sql<string>`donnee.id::text`.as("id"),
          sql<string>`donnee.inventaire_id::text`.as("inventaireId"),
          sql<string>`donnee.espece_id::text`.as("especeId"),
          sql<string>`donnee.sexe_id::text`.as("sexeId"),
          sql<string>`donnee.age_id::text`.as("ageId"),
          sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
          "nombre",
          sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
          "distance",
          "commentaire",
          "regroupement",
          "dateCreation",
        ])
        .executeTakeFirstOrThrow();

      let behaviorIdsResult: { comportementId: string }[] = [];
      if (entryInput.behaviorIds.length) {
        behaviorIdsResult = await trx
          .insertInto("donnee_comportement")
          .values(
            entryInput.behaviorIds.map((behaviorId) => {
              return { donneeId: Number.parseInt(entryResult.id), comportementId: Number.parseInt(behaviorId) };
            }),
          )
          .returning(sql<string>`donnee_comportement.comportement_id::text`.as("comportementId"))
          .execute();
      }

      let environmentIdsResult: { milieuId: string }[] = [];
      if (entryInput.environmentIds.length) {
        environmentIdsResult = await trx
          .insertInto("donnee_milieu")
          .values(
            entryInput.environmentIds.map((environmentId) => {
              return { donneeId: Number.parseInt(entryResult.id), milieuId: Number.parseInt(environmentId) };
            }),
          )
          .returning(sql<string>`donnee_milieu.milieu_id::text`.as("milieuId"))
          .execute();
      }

      return {
        ...entryResult,
        behaviorIds: behaviorIdsResult.map((behaviorId) => behaviorId.comportementId),
        environmentIds: environmentIdsResult.map((environmentId) => environmentId.milieuId),
      };
    });

    return entrySchema.parse(reshapeRawEntry(createdEntry));
  };

  const updateEntry = async (entryId: string, entryInput: EntryCreateInput): Promise<Entry> => {
    const updatedEntry = await kysely.transaction().execute(async (trx) => {
      const entryResult = await trx
        .updateTable("donnee")
        .set({
          inventaireId: Number.parseInt(entryInput.inventoryId),
          especeId: Number.parseInt(entryInput.speciesId),
          sexeId: Number.parseInt(entryInput.sexId),
          ageId: Number.parseInt(entryInput.ageId),
          estimationNombreId: Number.parseInt(entryInput.numberEstimateId),
          nombre: entryInput.number,
          estimationDistanceId:
            entryInput.distanceEstimateId != null ? Number.parseInt(entryInput.distanceEstimateId) : null,
          distance: entryInput.distance,
          commentaire: entryInput.comment,
          regroupement: entryInput.grouping,
        })
        .where("id", "=", Number.parseInt(entryId))
        .returning([
          sql<string>`donnee.id::text`.as("id"),
          sql<string>`donnee.inventaire_id::text`.as("inventaireId"),
          sql<string>`donnee.espece_id::text`.as("especeId"),
          sql<string>`donnee.sexe_id::text`.as("sexeId"),
          sql<string>`donnee.age_id::text`.as("ageId"),
          sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
          "nombre",
          sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
          "distance",
          "commentaire",
          "regroupement",
          "dateCreation",
        ])
        .executeTakeFirstOrThrow();

      await kysely.deleteFrom("donnee_comportement").where("donneeId", "=", Number.parseInt(entryId)).execute();

      let behaviorIdsResult: { comportementId: string }[] = [];
      if (entryInput.behaviorIds.length) {
        behaviorIdsResult = await trx
          .insertInto("donnee_comportement")
          .values(
            entryInput.behaviorIds.map((behaviorId) => {
              return { donneeId: Number.parseInt(entryResult.id), comportementId: Number.parseInt(behaviorId) };
            }),
          )
          .returning(sql<string>`donnee_comportement.comportement_id::text`.as("comportementId"))
          .execute();
      }

      await kysely.deleteFrom("donnee_milieu").where("donneeId", "=", Number.parseInt(entryId)).execute();

      let environmentIdsResult: { milieuId: string }[] = [];
      if (entryInput.environmentIds.length) {
        environmentIdsResult = await trx
          .insertInto("donnee_milieu")
          .values(
            entryInput.environmentIds.map((environmentId) => {
              return { donneeId: Number.parseInt(entryResult.id), milieuId: Number.parseInt(environmentId) };
            }),
          )
          .returning(sql<string>`donnee_milieu.milieu_id::text`.as("milieuId"))
          .execute();
      }

      return {
        ...entryResult,
        behaviorIds: behaviorIdsResult.map((behaviorId) => behaviorId.comportementId),
        environmentIds: environmentIdsResult.map((environmentId) => environmentId.milieuId),
      };
    });

    return entrySchema.parse(reshapeRawEntry(updatedEntry));
  };

  const deleteEntryById = async (entryId: string): Promise<Entry | null> => {
    const behaviorIdsResult = await kysely
      .selectFrom("donnee_comportement")
      .select(sql<string>`comportement_id::text`.as("comportementId"))
      .where("donneeId", "=", Number.parseInt(entryId))
      .execute();

    const environmentIdsResult = await kysely
      .selectFrom("donnee_milieu")
      .select(sql<string>`milieu_id::text`.as("milieuId"))
      .where("donneeId", "=", Number.parseInt(entryId))
      .execute();

    const deletedEntry = await kysely
      .deleteFrom("donnee")
      .where("id", "=", Number.parseInt(entryId))
      .returning([
        sql<string>`donnee.id::text`.as("id"),
        sql<string>`donnee.inventaire_id::text`.as("inventaireId"),
        sql<string>`donnee.espece_id::text`.as("especeId"),
        sql<string>`donnee.sexe_id::text`.as("sexeId"),
        sql<string>`donnee.age_id::text`.as("ageId"),
        sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
        "nombre",
        sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
        "distance",
        "commentaire",
        "regroupement",
        "dateCreation",
      ])
      .executeTakeFirst();

    return deletedEntry
      ? entrySchema.parse(
          reshapeRawEntry({
            ...deletedEntry,
            behaviorIds: behaviorIdsResult.map((behaviorId) => behaviorId.comportementId),
            environmentIds: environmentIdsResult.map((environmentId) => environmentId.milieuId),
          }),
        )
      : null;
  };

  const findLatestGrouping = async (): Promise<number | null> => {
    const result = await kysely
      .selectFrom("donnee")
      .select((eb) => eb.fn.max("regroupement").as("grouping"))
      .executeTakeFirstOrThrow();

    return result.grouping;
  };

  const updateAssociatedInventory = async (currentInventoryId: string, newInventoryId: string): Promise<void> => {
    await kysely
      .updateTable("donnee")
      .set({
        inventaireId: Number.parseInt(newInventoryId),
      })
      .where("inventaireId", "=", Number.parseInt(currentInventoryId))
      .execute();
  };

  return {
    findEntryById,
    getCount,
    createEntry,
    updateEntry,
    deleteEntryById,
    findLatestGrouping,
    updateAssociatedInventory,
  };
};
