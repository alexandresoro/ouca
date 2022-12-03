import { z } from "zod";

export const estimationNombreSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  nonCompte: z.boolean(),
  ownerId: z.string().uuid().nullable(),
});

export type EstimationNombre = z.infer<typeof estimationNombreSchema>;
