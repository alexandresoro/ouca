import { EntiteSimple } from "./entite-simple.object";

export type EspeceCommon = EntiteSimple & {
  code: string;

  nomFrancais: string;

  nomLatin: string;
}
