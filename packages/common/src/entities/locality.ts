import { z } from "zod";

export const localitySchema = z.object({
  id: z.coerce.string(),
  nom: z.string(),
  coordinates: z.object({
    altitude: z.number(),
    longitude: z.number(),
    latitude: z.number(),
  }),
  townId: z.string(),
  editable: z.boolean().optional(),
});

export type Locality = z.infer<typeof localitySchema>;
