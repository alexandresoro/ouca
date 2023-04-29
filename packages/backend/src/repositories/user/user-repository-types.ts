import { z } from "zod";

export const userWithPasswordSchema = z.object({
  id: z.string(),
  extProviderName: z.string().nullable(),
  extProviderId: z.string().nullable(),
});

export type UserWithPasswordResult = z.infer<typeof userWithPasswordSchema>;
