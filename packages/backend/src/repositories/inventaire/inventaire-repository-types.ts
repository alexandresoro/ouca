import type { CoordinatesSystemType } from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { z } from "zod";

export const inventaireSchema = z.object({
  id: z.string(),
  observateurId: z.number(),
  date: z.string(), // YYYY-MM-DD
  heure: z.string().nullable(),
  duree: z.string().nullable(),
  lieuditId: z.number(),
  altitude: z.number().nullable(),
  longitude: z.number().nullable(),
  latitude: z.number().nullable(),
  temperature: z.number().nullable(),
  dateCreation: z.number(), // timestamp
  ownerId: z.string().uuid().nullable(),
});

export type RawInventaire = z.infer<typeof inventaireSchema>;

export type Inventaire = Omit<RawInventaire, "altitude" | "latitude" | "longitude"> & {
  customizedCoordinates: {
    altitude: number;
    latitude: number;
    longitude: number;
  } | null;
};

export type InventaireCreateInput = {
  observateur_id: number;
  date: string; // YYYY-MM-DD
  heure?: string | null;
  duree?: string | null;
  lieudit_id: number;
  altitude?: number | null;
  longitude?: number | null;
  latitude?: number | null;
  coordinates_system?: CoordinatesSystemType | null;
  temperature?: number | null;
  owner_id?: string | null;
};
