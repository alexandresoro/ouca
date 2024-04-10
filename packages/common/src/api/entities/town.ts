import { z } from "zod";

export const townSchema = z.object({
  id: z.coerce.string(),
  code: z.number(),
  nom: z.string(),
  departmentId: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type Town = z.infer<typeof townSchema>;
