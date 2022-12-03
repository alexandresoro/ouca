import { z } from "zod";

export const especeSchema = z.object({
  id: z.number(),
  classeId: z.number().nullable(),
  code: z.string(),
  nomFrancais: z.string(),
  nomLatin: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Espece = z.infer<typeof especeSchema>;
