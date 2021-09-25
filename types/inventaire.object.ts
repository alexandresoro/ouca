import { LieuDit } from "../graphql";
import { EntiteSimple } from "./entite-simple.object";
import { EntityWithCoordinates } from "./entity-with-coordinates.model";
import { Meteo } from "./meteo.object";
import { Observateur } from "./observateur.object";

export type Inventaire = EntiteSimple & EntityWithCoordinates & {
  associes?: Observateur[];

  associesIds: number[];

  date: string;

  duree: string;

  heure: string;

  lieudit?: LieuDit;

  lieuditId: number;

  customizedAltitude?: number;

  meteos?: Meteo[];

  meteosIds: number[];

  observateur?: Observateur;

  observateurId: number;

  temperature: number;
}
