import { CoordinatesSystemType } from "ouca-common/coordinates-system";

export interface LieuditDb {
  id: number;
  commune_id: number;
  nom: string;
  altitude: number;
  longitude: number;
  latitude: number;
  coordinates_system: CoordinatesSystemType;
}
