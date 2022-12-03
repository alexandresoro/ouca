import { z } from "zod";
import { COORDINATES_SYSTEMS } from "../../model/coordinates-system/coordinates-system.object";

export const inventaireSchema = z.object({
  id: z.number(),
  observateurId: z.number(),
  date: z.date(),
  heure: z.string().nullable(),
  duree: z.string().nullable(),
  lieuditId: z.number(),
  altitude: z.number().nullable(),
  longitude: z.number().nullable(),
  latitude: z.number().nullable(),
  coordinatesSystem: z.enum(COORDINATES_SYSTEMS).nullable(),
  temperature: z.number().nullable(),
  dateCreation: z.date(),
  ownerId: z.string().uuid().nullable(),
});

export type Inventaire = z.infer<typeof inventaireSchema>;
