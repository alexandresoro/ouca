import { z } from "zod";

export const ageSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Age = z.infer<typeof ageSchema>;
