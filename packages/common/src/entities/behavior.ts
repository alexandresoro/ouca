import { z } from "zod";
import { NICHEUR_CODES } from "../types/nicheur.model.js";

export const behaviorSchema = z.object({
  id: z.coerce.string(),
  code: z.string(),
  libelle: z.string(),
  nicheur: z.enum(NICHEUR_CODES).nullable(),
  editable: z.boolean(),
});

export type Behavior = z.infer<typeof behaviorSchema>;

export const behaviorExtendedSchema = behaviorSchema.extend({
  entriesCount: z.number(),
});

export type BehaviorExtended = z.infer<typeof behaviorExtendedSchema>;
