import { EntiteAvecLibelle } from "./entite-avec-libelle.object";

export interface EstimationNombre extends EntiteAvecLibelle {
  nonCompte: boolean;

  nbDonnees: number;
}
