import { z } from "zod";
import { COORDINATES_SYSTEMS } from "../coordinates-system/coordinates-system.object.js";

export const localitySchema = z.object({
  id: z.coerce.string(),
  nom: z.string(),
  altitude: z.number(),
  longitude: z.number(),
  latitude: z.number(),
  coordinatesSystem: z.enum(COORDINATES_SYSTEMS),
  townId: z.coerce.string(),
  editable: z.boolean().optional(),
});

export type Locality = z.infer<typeof localitySchema>;
