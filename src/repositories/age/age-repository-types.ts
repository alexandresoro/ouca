import { z } from "zod";

export const ageSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Age = z.infer<typeof ageSchema>;

export type AgeCreateInput = {
  libelle: string;
  owner_id?: string | null;
};
