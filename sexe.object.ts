import { EntiteAvecLibelle } from "./entite-avec-libelle.object";

export interface Sexe extends EntiteAvecLibelle {
  libelle: string;

  nbDonnees: number;
}
