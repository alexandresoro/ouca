import { z } from "zod";

export const departementSchema = z.object({
  id: z.number(),
  code: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Departement = z.infer<typeof departementSchema>;
