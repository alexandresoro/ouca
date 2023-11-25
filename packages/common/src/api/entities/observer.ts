import { z } from "zod";

export const observerSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean(),
  inventoriesCount: z.number(),
  entriesCount: z.number(),
});

export type Observer = z.infer<typeof observerSchema>;

export const observerSimpleSchema = observerSchema.omit({
  inventoriesCount: true,
  entriesCount: true,
});

export type ObserverSimple = z.infer<typeof observerSimpleSchema>;
