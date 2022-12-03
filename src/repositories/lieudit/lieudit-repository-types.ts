import { z } from "zod";
import { COORDINATES_SYSTEMS } from "../../model/coordinates-system/coordinates-system.object";

export const lieuditSchema = z.object({
  id: z.number(),
  communeId: z.number(),
  nom: z.string(),
  altitude: z.number(),
  longitude: z.number(),
  latitude: z.number(),
  coordinatesSystem: z.enum(COORDINATES_SYSTEMS),
  ownerId: z.string().uuid().nullable(),
});

export type Lieudit = z.infer<typeof lieuditSchema>;
