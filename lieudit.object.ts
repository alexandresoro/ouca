import { Commune } from "./commune.object";
import { EntiteAvecLibelle } from "./entite-avec-libelle.object";
import { EntiteSimple } from "./entite-simple.object";

export interface Lieudit extends EntiteSimple {
  communeId: number;

  commune: Commune;

  nom: string;

  altitude: number;

  latitude: number;

  nbDonnees: number;
}
