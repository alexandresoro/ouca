import { z } from "zod";

export const coordinatesSchema = z.object({
  altitude: z.number(),
  longitude: z.number(),
  latitude: z.number(),
});

export type Coordinates = z.infer<typeof coordinatesSchema>;
