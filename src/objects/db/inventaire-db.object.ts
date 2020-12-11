import { CoordinatesSystemType } from "@ou-ca/ouca-model/coordinates-system";

export interface InventaireDb {
  id: number;
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
