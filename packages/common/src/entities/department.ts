import { z } from "zod";

export const departmentSchema = z.object({
  id: z.coerce.string(),
  code: z.string(),
  editable: z.boolean(),
});

export type Department = z.infer<typeof departmentSchema>;

export const departmentExtendedSchema = departmentSchema.extend({
  localitiesCount: z.number(),
  townsCount: z.number(),
  entriesCount: z.number(),
});

export type DepartmentExtended = z.infer<typeof departmentExtendedSchema>;
