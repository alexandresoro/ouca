import { Commune } from "./commune.object";
import { EntiteSimple } from "./entite-simple.object";
import { EntityWithCoordinates } from "./entity-with-coordinates.object";
import { CoordinatesSystem } from "./coordinates-system/coordinates-system.object";

export interface Lieudit extends EntiteSimple, EntityWithCoordinates {
  communeId: number;

  commune?: Commune;

  nom: string;

  altitude: number;
}
