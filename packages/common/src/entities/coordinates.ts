import { z } from "zod";
import { COORDINATES_SYSTEMS } from "../coordinates-system/coordinates-system.object.js";

export const coordinatesSchema = z.object({
  altitude: z.number(),
  longitude: z.number(),
  latitude: z.number(),
  system: z.enum(COORDINATES_SYSTEMS).nullable(),
});

export type Coordinates = z.infer<typeof coordinatesSchema>;
