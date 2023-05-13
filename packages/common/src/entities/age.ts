import { z } from "zod";

export const ageSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean().optional(),
});

export type Age = z.infer<typeof ageSchema>;
