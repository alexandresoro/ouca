import { z } from "zod";

const databaseRoles = ["admin", "contributor"] as const;
export type DatabaseRole = typeof databaseRoles[number];

export const getUserInfoByIdSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(databaseRoles),
  firstName: z.string(),
  lastName: z.string().nullable(),
});

export type UserInfo = z.infer<typeof getUserInfoByIdSchema>;

export const findByUserNameSchema = getUserInfoByIdSchema.extend({
  password: z.string(),
});

export type FindByUserNameResult = z.infer<typeof findByUserNameSchema>;
