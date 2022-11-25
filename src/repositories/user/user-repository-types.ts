import { z } from "zod";

const databaseRoles = ["admin", "contributor"] as const;
export type DatabaseRole = typeof databaseRoles[number];

export const findByUserNameSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  role: z.enum(databaseRoles),
  firstName: z.string(),
  lastName: z.string().nullable(),
});

export type FindByUserNameResult = z.infer<typeof findByUserNameSchema>;
