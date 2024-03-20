import {
  type Inventory,
  type InventoryCreateInput,
  type InventoryFindManyInput,
  inventorySchema,
} from "@domain/inventory/inventory.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { type OperandExpression, type SqlBool, sql } from "kysely";
import { z } from "zod";
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

  const findInventoryIndex = async (
    id: string,
    {
      // biome-ignore lint/correctness/noUnusedVariables: <explanation>
      orderBy,
      sortOrder,
    }: {
      orderBy: NonNullable<InventoryFindManyInput["orderBy"]>;
      sortOrder: NonNullable<InventoryFindManyInput["sortOrder"]>;
    },
  ): Promise<number | null> => {
    const orderByIdentifier = "date_creation";

    const indexResult = await kysely
      .selectFrom((eb) =>
        eb
          .selectFrom("inventaire")
          .select([
            "id",
            sql`ROW_NUMBER() OVER ( ORDER BY ${sql.ref(orderByIdentifier)} ${sql.raw(sortOrder)} )`.as("index"),
          ])
          .as("result"),
      )
      .select("result.index")
      .where("result.id", "=", Number.parseInt(id))
      .executeTakeFirst();

    return indexResult ? z.object({ index: z.coerce.number() }).parse(indexResult).index : null;
  };

  const findInventories = async ({
    orderBy,
    sortOrder,
    offset,
    limit,
  }: InventoryFindManyInput = {}): Promise<Inventory[]> => {
    let queryInventories = kysely
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
      ]);

    if (orderBy != null) {
      const orderByIdentifier = "dateCreation";
      queryInventories = queryInventories.orderBy(orderByIdentifier, sortOrder ?? undefined);
    }

    if (offset != null) {
      queryInventories = queryInventories.offset(offset);
    }

    if (limit != null) {
      queryInventories = queryInventories.limit(limit);
    }

    const rawInventories = await queryInventories.execute();

    return z.array(inventorySchema).parse(rawInventories.map((rawInventory) => reshapeRawInventory(rawInventory)));
  };

  const findExistingInventory = async (criteria: InventoryCreateInput): Promise<Inventory | null> => {
    const inventoryResult = await kysely
      .selectFrom("inventaire")
      .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
      .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
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
      .where((eb) => {
        const clause: OperandExpression<SqlBool>[] = [];

        clause.push(eb("inventaire.observateurId", "=", Number.parseInt(criteria.observerId)));
        clause.push(eb("inventaire.date", "=", new Date(criteria.date)));
        clause.push(eb("inventaire.heure", "=", criteria.time ?? null));
        clause.push(eb("inventaire.duree", "=", criteria.duration ?? null));
        clause.push(eb("inventaire.lieuditId", "=", Number.parseInt(criteria.localityId)));
        clause.push(eb("inventaire.altitude", "=", criteria.customizedCoordinates?.altitude ?? null));
        clause.push(eb("inventaire.longitude", "=", criteria.customizedCoordinates?.longitude ?? null));
        clause.push(eb("inventaire.latitude", "=", criteria.customizedCoordinates?.latitude ?? null));
        clause.push(eb("inventaire.temperature", "=", criteria.temperature ?? null));

        if (criteria.associateIds.length) {
          clause.push(
            eb(
              "inventaire_associe.observateurId",
              "in",
              criteria.associateIds.map((associateId) => Number.parseInt(associateId)),
            ),
          );
        }

        if (criteria.weatherIds.length) {
          clause.push(
            eb(
              "inventaire_meteo.meteoId",
              "in",
              criteria.weatherIds.map((weatherId) => Number.parseInt(weatherId)),
            ),
          );
        }

        return eb.and(clause);
      })
      .groupBy("inventaire.id")
      .having((eb) =>
        eb.and([
          eb(eb.fn.count("inventaire_associe.observateurId").distinct(), "=", criteria.associateIds.length),
          eb(eb.fn.count("inventaire_meteo.meteoId").distinct(), "=", criteria.weatherIds.length),
        ]),
      )
      .limit(1)
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
    findInventoryIndex,
    findInventories,
    findExistingInventory,
    getCount,
    getCountByLocality,
    deleteInventoryById,
  };
};
