import { EntiteSimple } from "./entite-simple.object";

export interface EspeceCommon extends EntiteSimple {
  code: string;

  nomFrancais: string;

  nomLatin: string;
}
