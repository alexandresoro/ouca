import { z } from "zod";

export const entrySchema = z.object({
  id: z.coerce.string(),
  inventoryId: z.coerce.string(),
  speciedId: z.coerce.string(),
  sexId: z.coerce.string(),
  age: z.coerce.string(),
  numberEstimateId: z.coerce.string(),
  nombre: z.number().optional(),
  distanceEstimateId: z.coerce.string().optional(),
  distance: z.number().optional(),
  regroupement: z.number().optional(),
  behaviorIds: z.array(z.coerce.string()),
  environmentIds: z.array(z.coerce.string()),
  commentaire: z.string().optional(),
});

export type Entry = z.infer<typeof entrySchema>;
