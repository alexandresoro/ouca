import { z } from "zod";
import { userRoles } from "../../types/User.js";

export const userWithPasswordSchema = z.object({
  id: z.string(),
  role: z.enum(userRoles),
  extProviderName: z.string().nullable(),
  extProviderId: z.string().nullable(),
});

export type UserWithPasswordResult = z.infer<typeof userWithPasswordSchema>;
