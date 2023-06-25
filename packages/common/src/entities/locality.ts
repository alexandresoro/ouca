import { z } from "zod";
import { coordinatesSchema } from "./coordinates.js";

export const localitySchema = z.object({
  id: z.coerce.string(),
  nom: z.string(),
  coordinates: coordinatesSchema,
  townId: z.string(),
  editable: z.boolean(),
});

export type Locality = z.infer<typeof localitySchema>;

export const localityExtendedSchema = localitySchema.extend({
  entriesCount: z.number(),
});

export type LocalityExtended = z.infer<typeof localityExtendedSchema>;
