import { z } from "zod";

export const meteoSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Meteo = z.infer<typeof meteoSchema>;
