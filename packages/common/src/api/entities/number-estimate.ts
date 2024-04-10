import { z } from "zod";

export const numberEstimateSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  nonCompte: z.boolean(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type NumberEstimate = z.infer<typeof numberEstimateSchema>;
