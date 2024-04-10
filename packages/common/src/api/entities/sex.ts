import { z } from "zod";

export const sexSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type Sex = z.infer<typeof sexSchema>;
