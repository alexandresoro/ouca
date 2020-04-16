import { EntiteSimple } from "./entite-simple.object";
import { EntityWithCoordinates } from "./entity-with-coordinates.model";

export interface LieuditCommon extends EntiteSimple, EntityWithCoordinates {
  nom: string;

  altitude: number;
}
