import { z } from "zod";
import {
  COORDINATES_SYSTEMS,
  type CoordinatesSystemType,
} from "../../model/coordinates-system/coordinates-system.object";
import { type SortOrder } from "../common";

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

export type LieuditFindManyInput = Partial<{
  q: string | null;
  orderBy:
    | "id"
    | "nom"
    | "altitude"
    | "latitude"
    | "longitude"
    | "codeCommune"
    | "nomCommune"
    | "departement"
    | "nbDonnees"
    | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type LieuditCreateInput = {
  commune_id: number;
  nom: string;
  altitude: number;
  latitude: number;
  longitude: number;
  coordinates_system: CoordinatesSystemType;
  owner_id?: string | null;
};
