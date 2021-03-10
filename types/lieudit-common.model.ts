import { EntiteSimple } from "./entite-simple.object";
import { EntityWithCoordinates } from "./entity-with-coordinates.model";

export type LieuditCommon = EntiteSimple & EntityWithCoordinates & {
  nom: string;

  altitude: number;
}
