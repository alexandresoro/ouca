import { z } from "zod";

export const sexSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean().optional(),
});

export type Sex = z.infer<typeof sexSchema>;
