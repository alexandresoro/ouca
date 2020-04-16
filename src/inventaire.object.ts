import { EntiteSimple } from "./entite-simple.object";
import { EntityWithCoordinates } from "./entity-with-coordinates.model";
import { Lieudit } from "./lieudit.model";
import { Meteo } from "./meteo.object";
import { Observateur } from "./observateur.object";

export interface Inventaire extends EntiteSimple, EntityWithCoordinates {
  associes?: Observateur[];

  associesIds: number[];

  date: string;

  duree: string | null;

  heure: string | null;

  lieudit?: Lieudit;

  lieuditId: number;

  customizedAltitude: number | null;

  meteos?: Meteo[];

  meteosIds: number[];

  observateur?: Observateur;

  observateurId: number;

  temperature: number | null;
}
