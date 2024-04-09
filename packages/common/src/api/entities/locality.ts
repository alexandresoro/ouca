import { z } from "zod";
import { coordinatesSchema } from "./coordinates.js";

export const localitySchema = z.object({
  id: z.coerce.string(),
  nom: z.string(),
  coordinates: coordinatesSchema,
  townId: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type Locality = z.infer<typeof localitySchema>;

/**
 * @deprecated Use `localitySchema` instead.
 */
export const localityExtendedSchema = localitySchema.extend({
  townCode: z.number(),
  townName: z.string(),
  departmentCode: z.string(),
  inventoriesCount: z.number(),
  entriesCount: z.number(),
});

/**
 * @deprecated Use `Locality` instead.
 */
export type LocalityExtended = z.infer<typeof localityExtendedSchema>;
