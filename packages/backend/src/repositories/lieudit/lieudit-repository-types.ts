import { localitySchema } from "@domain/locality/locality.js";
import type { CoordinatesSystemType } from "@ou-ca/common/coordinates-system/coordinates-system.object";
import { z } from "zod";
import type { SortOrder } from "../common.js";

export const lieuditWithCommuneAndDepartementCodeSchema = localitySchema.extend({
  communeCode: z.number(),
  communeNom: z.string(),
  departementCode: z.string(),
});

export type LieuditWithCommuneAndDepartementCode = z.infer<typeof lieuditWithCommuneAndDepartementCodeSchema>;

export type LieuditFindManyInput = Partial<{
  q: string | null;
  townId?: number | null;
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
