import { EntiteSimple } from "./entite-simple.object";
import { Lieudit } from "./lieudit.object";
import { Meteo } from "./meteo.object";
import { Observateur } from "./observateur.object";

export interface Inventaire extends EntiteSimple {
  associes?: Observateur[];

  associesIds: number[];

  date: Date;

  duree: string | null;

  heure: string | null;

  lieudit?: Lieudit;

  lieuditId: number;

  customizedCoordinatesL2E?: Coordinates;

  customizedCoordinatesL93?: Coordinates;

  customizedCoordinatesGPS?: Coordinates;

  altitude: number | null;

  longitude: number | null;

  latitude: number | null;

  meteos?: Meteo[];

  meteosIds: number[];

  observateur?: Observateur;

  observateurId: number;

  temperature: number | null;
}
