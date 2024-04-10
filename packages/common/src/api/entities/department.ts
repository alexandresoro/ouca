import { z } from "zod";

export const departmentSchema = z.object({
  id: z.coerce.string(),
  code: z.string(),
  ownerId: z.string().uuid().nullable(),
  editable: z.boolean(),
});

export type Department = z.infer<typeof departmentSchema>;
