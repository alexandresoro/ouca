import { z } from "zod";

export const weatherSchema = z.object({
  id: z.coerce.string(),
  libelle: z.string(),
  editable: z.boolean().optional(),
});

export type Weather = z.infer<typeof weatherSchema>;
