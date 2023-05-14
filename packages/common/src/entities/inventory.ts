import { z } from "zod";
import { coordinatesSchema } from "./coordinates.js";

export const inventorySchema = z.object({
  id: z.coerce.string(),
  observerId: z.coerce.string(),
  associateIds: z.array(z.coerce.string()),
  date: z.string(),
  heure: z.string().optional(),
  duree: z.string().optional(),
  localityId: z.coerce.string(),
  customizedCoordinates: coordinatesSchema,
  temperature: z.number().optional(),
  weatherIds: z.array(z.coerce.string()),
});

export type Inventory = z.infer<typeof inventorySchema>;
