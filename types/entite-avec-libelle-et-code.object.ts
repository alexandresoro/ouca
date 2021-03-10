import { EntiteAvecLibelle } from "./entite-avec-libelle.object";

export type EntiteAvecLibelleEtCode = EntiteAvecLibelle & {
  code: string;
}
