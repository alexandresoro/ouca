import { z } from "zod";

export const department = z.object({
  id: z.coerce.string(),
  code: z.string(),
  editable: z.boolean().optional(),
});

export type Departement = z.infer<typeof department>;
