import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  extProviderName: z.string().nullable(),
  extProviderId: z.string().nullable(),
});

export type UserResult = z.infer<typeof userSchema>;
