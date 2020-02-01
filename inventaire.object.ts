import { EntiteSimple } from "./entite-simple.object";
import { Lieudit } from "./lieudit.object";
import { Meteo } from "./meteo.object";
import { Observateur } from "./observateur.object";
import { Coordinates } from "./coordinates.object";

export interface Inventaire extends EntiteSimple {
  associes?: Observateur[];

  associesIds: number[];

  date: Date;

  duree: string | null;

  heure: string | null;

  lieudit?: Lieudit;

  lieuditId: number;

  customizedAltitude: number | null;

  customizedCoordinatesL2E: Coordinates;

  customizedCoordinatesL93?: Coordinates;

  customizedCoordinatesGPS?: Coordinates;

  meteos?: Meteo[];

  meteosIds: number[];

  observateur?: Observateur;

  observateurId: number;

  temperature: number | null;
}
