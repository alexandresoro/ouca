import { z } from "zod";

export const observerSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean(),
});

export type Observer = z.infer<typeof observerSchema>;

export const observerExtendedSchema = observerSchema.extend({
  entriesCount: z.number(),
});

export type ObserverExtended = z.infer<typeof observerExtendedSchema>;
