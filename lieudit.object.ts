import { Commune } from "./commune.object";
import { EntiteSimple } from "./entite-simple.object";
import { Coordinates } from "./coordinates.object";

export interface Lieudit extends EntiteSimple {
  communeId: number;

  commune?: Commune;

  nom: string;

  altitude: number;

  latitude: number;

  longitude: number;

  // Lambert II étendu
  coordinatesL2E?: Coordinates;

  // Lambert 93
  coordinatesL93?: Coordinates;

  // GPS
  coordinatesGPS?: Coordinates;
}
