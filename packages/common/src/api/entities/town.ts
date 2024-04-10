import { z } from "zod";

export const townSchema = z.object({
  id: z.coerce.string(),
  code: z.number(),
  nom: z.string(),
  departmentId: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Town = z.infer<typeof townSchema>;
