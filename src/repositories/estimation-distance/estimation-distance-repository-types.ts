import { z } from "zod";

export const estimationDistanceSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type EstimationDistance = z.infer<typeof estimationDistanceSchema>;
