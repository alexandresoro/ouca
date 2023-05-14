import { z } from "zod";

export const numberEstimateSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  nonCompte: z.boolean(),
  editable: z.boolean().optional(),
});

export type NumberEstimate = z.infer<typeof numberEstimateSchema>;
