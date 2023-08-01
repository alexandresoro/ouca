import { isAfter, isBefore } from "date-fns";
import { z } from "zod";
import { inventoryExtendedSchema } from "../entities/inventory.js";
import { getPaginatedResponseSchema, paginationQueryParamsSchema } from "./common/pagination.js";

/**
 * `GET` `/inventory/:id`
 *  Retrieve inventory
 */
export const getInventoryResponse = inventoryExtendedSchema;

export type GetInventoryResponse = z.infer<typeof getInventoryResponse>;

/**
 * `GET` `/inventories`
 *  Retrieve paginated inventories results
 */
export const INVENTORIES_ORDER_BY_ELEMENTS = ["creationDate"] as const;
export type InventoriesOrderBy = typeof INVENTORIES_ORDER_BY_ELEMENTS[number];

export const getInventoriesQueryParamsSchema = paginationQueryParamsSchema.required().extend({
  orderBy: z.enum(INVENTORIES_ORDER_BY_ELEMENTS).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type InventoriesSearchParams = z.infer<typeof getInventoriesQueryParamsSchema>;

export const getInventoriesResponse = getPaginatedResponseSchema(inventoryExtendedSchema);

export const getInventoryIndexParamsSchema = z.object({
  orderBy: z.enum(INVENTORIES_ORDER_BY_ELEMENTS),
  sortOrder: z.enum(["asc", "desc"]),
});

export const getInventoryIndexResponse = z.number();

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

export const upsertInventoryResponse = inventoryExtendedSchema;

export type UpsertInventoryResponse = z.infer<typeof upsertInventoryResponse>;
