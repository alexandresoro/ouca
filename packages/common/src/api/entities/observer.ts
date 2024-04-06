import { z } from "zod";

export const observerSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Observer = z.infer<typeof observerSchema>;
