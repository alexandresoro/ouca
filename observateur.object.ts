import { EntiteAvecLibelle } from "./entite-avec-libelle.object";

export interface Observateur extends EntiteAvecLibelle {
  libelle: string;

  nbDonnees: number;
}
