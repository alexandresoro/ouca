import { EntiteAvecLibelleEtCode } from "./entite-avec-libelle-et-code.object";
import { Nicheur, NicheurCode } from "./nicheur.model";

export interface Comportement extends EntiteAvecLibelleEtCode {
  isNicheur?: boolean;

  nicheur: Nicheur | NicheurCode;
}
