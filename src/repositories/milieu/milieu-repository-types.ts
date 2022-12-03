import { z } from "zod";

export const milieuSchema = z.object({
  id: z.number(),
  code: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Milieu = z.infer<typeof milieuSchema>;
