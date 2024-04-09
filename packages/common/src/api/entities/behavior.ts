import { z } from "zod";
import { NICHEUR_CODES } from "../../types/nicheur.model.js";

export const behaviorSchema = z.object({
  id: z.coerce.string(),
  code: z.string(),
  libelle: z.string(),
  nicheur: z.enum(NICHEUR_CODES).nullable(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type Behavior = z.infer<typeof behaviorSchema>;

/**
 * @deprecated Use `behaviorSchema` instead.
 */
export const behaviorExtendedSchema = behaviorSchema.extend({
  entriesCount: z.number(),
});

/**
 * @deprecated Use `Behavior` instead.
 */
export type BehaviorExtended = z.infer<typeof behaviorExtendedSchema>;
