import { type Entry, entrySchema } from "@domain/entry/entry.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { reshapeRawEntry } from "@infrastructure/repositories/entry/entry-repository-reshape.js";
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
    deleteEntryById,
    findLatestGrouping,
    updateAssociatedInventory,
  };
};
