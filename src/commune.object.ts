import { Departement } from "./departement.object";
import { EntiteSimple } from "./entite-simple.object";

export interface Commune extends EntiteSimple {
  departement?: Departement;

  departementId: number;

  code: number;

  nom: string;

  nbLieuxdits?: number;
}
