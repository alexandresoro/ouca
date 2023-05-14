import { z } from "zod";

export const environmentSchema = z.object({
  id: z.coerce.string(),
  code: z.string(),
  libelle: z.string(),
  editable: z.boolean().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;
