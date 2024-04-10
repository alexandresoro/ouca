import { z } from "zod";

export const environmentSchema = z.object({
  id: z.coerce.string(),
  code: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Environment = z.infer<typeof environmentSchema>;
