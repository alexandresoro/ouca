import { CoordinatesSystemType } from "../../model/coordinates-system/coordinates-system.object";
import { EntityDb } from "./entity-db.model";

export type InventaireDb = EntityDb & {
  observateur_id: number;
  date: string;
  heure: string;
  duree: string;
  lieudit_id: number;
  altitude?: number;
  longitude?: number;
  latitude?: number;
  coordinates_system?: CoordinatesSystemType;
  temperature: number;
  date_creation: string;
}

export type InventaireDbWithJoins = InventaireDb & {
  meteos_ids?: string, // The list of meteos comma-separated
  associes_ids?: string // The list of associes comma-separated
}

export type InventaireCompleteWithIds = InventaireDb & {
  meteos_ids: Set<number>,
  associes_ids: Set<number>
}