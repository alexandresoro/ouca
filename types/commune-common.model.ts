import { EntiteSimple } from "./entite-simple.object";

export type CommuneCommon = EntiteSimple & {
  code: number;

  nom: string;

  nbLieuxdits?: number;
}
