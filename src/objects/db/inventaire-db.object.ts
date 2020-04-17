import { CoordinatesSystemType } from "ouca-common/coordinates-system";

export interface InventaireDb {
  id: number;
  observateur_id: number;
  date: any;
  heure: string;
  duree: string;
  lieudit_id: number;
  altitude: number;
  longitude: number;
  latitude: number;
  coordinates_system: CoordinatesSystemType;
  temperature: number;
  date_creation: any;
}
