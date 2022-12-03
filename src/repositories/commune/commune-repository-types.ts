import { z } from "zod";

export const communeSchema = z.object({
  id: z.number(),
  departementId: z.number(),
  code: z.number(),
  nom: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Commune = z.infer<typeof communeSchema>;
