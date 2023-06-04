import { isAfter, isBefore } from "date-fns";
import { z } from "zod";
import { inventorySchema } from "../entities/inventory.js";

/**
 * `GET` `/inventory/:id`
 *  Retrieve inventory
 */
export const getInventoryResponse = inventorySchema;

export type GetInventoryResponse = z.infer<typeof getInventoryResponse>;

/**
 * `PUT` `/inventory/:id` Update of inventory
 * `POST` `/inventory` Create new inventory
 */
export const upsertInventoryInput = z.object({
  observerId: z.string().trim().min(1),
  associateIds: z.array(z.string().trim().min(1)),
  date: z
    .string()
    .trim()
    .min(1)
    .refine((dateStr) => {
      const date = new Date(dateStr);
      return isAfter(date, new Date(1990, 0, 1)) && isBefore(date, new Date(2100, 0, 1));
    }),
  time: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).nullable(),
  duration: z.string().regex(/^[0-9]{1,2}:[0-5][0-9]$/).nullable(),
  localityId: z.string().trim().min(1),
  coordinates: z
    .object({
      altitude: z.number().int().min(-1000).max(9000),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .nullable(),
  weatherIds: z.array(z.string().trim().min(1)),
  temperature: z.number().int().min(-50).max(100).nullable(),
  migrateDonneesIfMatchesExistingInventaire: z.boolean().optional(),
});

export type UpsertInventoryInput = z.infer<typeof upsertInventoryInput>;

export const upsertInventoryResponse = inventorySchema;

export type UpsertInventoryResponse = z.infer<typeof upsertInventoryResponse>;
