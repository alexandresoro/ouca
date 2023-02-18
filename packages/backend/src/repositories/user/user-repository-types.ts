import { z } from "zod";
import { databaseRoles } from "../../types/User.js";

export const userWithPasswordSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  role: z.enum(databaseRoles),
  firstName: z.string(),
  lastName: z.string().nullable(),
});

export type UserWithPasswordResult = z.infer<typeof userWithPasswordSchema>;
