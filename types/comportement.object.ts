import { EntiteAvecLibelleEtCode } from "./entite-avec-libelle-et-code.object";
import { NicheurCode } from "./nicheur.model";

export type Comportement = EntiteAvecLibelleEtCode & {
  nicheur: NicheurCode;
}
