import { z } from "zod";

export const departmentSchema = z.object({
  id: z.coerce.string(),
  code: z.string(),
  editable: z.boolean().optional(),
});

export type Department = z.infer<typeof departmentSchema>;
