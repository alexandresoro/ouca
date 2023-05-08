import { z } from "zod";

export const observer = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean().optional(),
});

export type Observer = z.infer<typeof observer>;
