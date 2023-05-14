import { z } from "zod";
import { inventorySchema } from "../entities/inventory.js";

/**
 * `PUT` `/inventory/:id` Update of inventory
 * `POST` `/inventory` Create new inventory
 */
export const upsertInventoryInput = z.object({
  observerId: z.number(),
  associateIds: z.array(z.number()),
  date: z.string(),
  time: z.string().nullable(),
  duration: z.string().nullable(),
  localityId: z.number(),
  altitude: z.number().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  weatherIds: z.array(z.number()),
  temperature: z.number().nullable(),
  migrateDonneesIfMatchesExistingInventaire: z.boolean().optional(),
});

export type UpsertInventoryInput = z.infer<typeof upsertInventoryInput>;

export const upsertInventoryResponse = inventorySchema;

export type UpsertInventoryResponse = z.infer<typeof upsertInventoryResponse>;
