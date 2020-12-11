import { CoordinatesSystemType } from "@ou-ca/ouca-model/coordinates-system";
import { EntityDb } from "./entity-db.model";

export interface LieuditDb extends EntityDb {
  commune_id: number;
  nom: string;
  altitude: number;
  longitude?: number;
  latitude?: number;
  coordinates_system?: CoordinatesSystemType;
}
