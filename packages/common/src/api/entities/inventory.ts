import { z } from "zod";
import { coordinatesSchema } from "./coordinates.js";
import { localityExtendedSchema, localitySchema } from "./locality.js";
import { observerSimpleSchema } from "./observer.js";
import { weatherSchema } from "./weather.js";

export const inventorySchema = z.object({
  id: z.string(),
  observer: observerSimpleSchema,
  associates: z.array(observerSimpleSchema),
  date: z.string(),
  heure: z.string().nullable(),
  duree: z.string().nullable(),
  locality: localitySchema,
  customizedCoordinates: coordinatesSchema.nullable(),
  temperature: z.number().nullable(),
  weathers: z.array(weatherSchema),
});

export type Inventory = z.infer<typeof inventorySchema>;

export const inventoryExtendedSchema = inventorySchema.omit({ locality: true }).extend({
  locality: localityExtendedSchema.omit({ inventoriesCount: true, entriesCount: true }),
});

export type InventoryExtended = z.infer<typeof inventoryExtendedSchema>;
