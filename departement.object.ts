import { EntiteSimple } from "./entite-simple.object";

export interface Departement extends EntiteSimple {
  code: string;

  nbCommunes: number;

  nbLieuxdits: number;

  nbDonnees: number;
}
