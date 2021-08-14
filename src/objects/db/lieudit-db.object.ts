import { Decimal } from "@prisma/client/runtime";
import { CoordinatesSystemType } from "../../model/coordinates-system/coordinates-system.object";
import { EntityDb } from "./entity-db.model";

export interface LieuditDb extends EntityDb {
  commune_id: number;
  nom: string;
  altitude: number;
  longitude?: Decimal;
  latitude?: Decimal;
  coordinates_system?: CoordinatesSystemType;
}
