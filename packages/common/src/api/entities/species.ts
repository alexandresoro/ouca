import { z } from "zod";
import { speciesClassSchema } from "./species-class.js";

export const speciesSchema = z.object({
  id: z.coerce.string(),
  code: z.string(),
  nomFrancais: z.string(),
  nomLatin: z.string(),
  classId: z.string().nullable(), // FIXME: field is nullable in DB
  speciesClass: speciesClassSchema.nullable(),
  editable: z.boolean(),
});

export type Species = z.infer<typeof speciesSchema>;

export const speciesExtendedSchema = speciesSchema.extend({
  entriesCount: z.number(),
});

export type SpeciesExtended = z.infer<typeof speciesExtendedSchema>;
