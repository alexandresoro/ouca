import { z } from "zod";

export const classeSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Classe = z.infer<typeof classeSchema>;
