import { z } from "zod";

export const speciesSchema = z.object({
  id: z.coerce.string(),
  code: z.string(),
  nomFrancais: z.string(),
  nomLatin: z.string(),
  classId: z.coerce.string(),
  editable: z.boolean().optional(),
});

export type Species = z.infer<typeof speciesSchema>;
