import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  extProviderName: z.string().nullable(),
  extProviderId: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;

export type CreateUserInput = {
  extProvider: string;
  extProviderUserId: string;
};
