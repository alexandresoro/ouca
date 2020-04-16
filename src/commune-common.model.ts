import { EntiteSimple } from "./entite-simple.object";

export interface CommuneCommon extends EntiteSimple {
  code: number;

  nom: string;

  nbLieuxdits?: number;
}
