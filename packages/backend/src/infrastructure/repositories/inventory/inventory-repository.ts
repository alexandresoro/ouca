import { type Inventory, inventorySchema } from "@domain/inventory/inventory.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql } from "kysely";
import { countSchema } from "../common.js";
import { reshapeRawInventory } from "./inventory-repository-reshape.js";

export const buildInventoryRepository = () => {
  const findInventoryById = async (id: number): Promise<Inventory | null> => {
    const inventoryResult = await kysely
      .selectFrom("inventaire")
      .select([
        sql<string>`id::text`.as("id"),
        sql<string>`observateur_id::text`.as("observateurId"),
        "date",
        "heure",
        "duree",
        sql<string>`lieudit_id::text`.as("lieuditId"),
        "altitude",
        "longitude",
        "latitude",
        "temperature",
        "dateCreation",
        "ownerId",
      ])
      .where("id", "=", id)
      .executeTakeFirst();

    return inventoryResult ? inventorySchema.parse(reshapeRawInventory(inventoryResult)) : null;
  };

  const findInventoryByEntryId = async (entryId: string): Promise<Inventory | null> => {
    const inventoryResult = await kysely
      .selectFrom("inventaire")
      .leftJoin("donnee", "inventaire.id", "donnee.inventaireId")
      .select([
        sql<string>`inventaire.id::text`.as("id"),
        sql<string>`inventaire.observateur_id::text`.as("observateurId"),
        "inventaire.date",
        "inventaire.heure",
        "inventaire.duree",
        sql<string>`inventaire.lieudit_id::text`.as("lieuditId"),
        "inventaire.altitude",
        "inventaire.longitude",
        "inventaire.latitude",
        "inventaire.temperature",
        "inventaire.dateCreation",
        "inventaire.ownerId",
      ])
      .where("donnee.id", "=", Number.parseInt(entryId))
      .executeTakeFirst();

    return inventoryResult ? inventorySchema.parse(reshapeRawInventory(inventoryResult)) : null;
  };

  const getCount = async (): Promise<number> => {
    const countResult = await kysely
      .selectFrom("inventaire")
      .select((eb) => eb.fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return countSchema.parse(countResult).count;
  };

  const getCountByLocality = async (localityId: string): Promise<number> => {
    const countResult = await kysely
      .selectFrom("inventaire")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("inventaire.lieuditId", "=", Number.parseInt(localityId))
      .executeTakeFirstOrThrow();

    return countSchema.parse(countResult).count;
  };

  const deleteInventoryById = async (inventoryId: string): Promise<Inventory | null> => {
    const deletedInventory = await kysely
      .deleteFrom("inventaire")
      .where("id", "=", Number.parseInt(inventoryId))
      .returning([
        sql<string>`id::text`.as("id"),
        sql<string>`observateur_id::text`.as("observateurId"),
        "date",
        "heure",
        "duree",
        sql<string>`lieudit_id::text`.as("lieuditId"),
        "altitude",
        "longitude",
        "latitude",
        "temperature",
        "dateCreation",
        "ownerId",
      ])
      .executeTakeFirst();

    return deletedInventory ? inventorySchema.parse(reshapeRawInventory(deletedInventory)) : null;
  };

  return {
    findInventoryById,
    findInventoryByEntryId,
    getCount,
    getCountByLocality,
    deleteInventoryById,
  };
};
