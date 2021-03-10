import { EntiteSimple } from "./entite-simple.object";

export type Departement = EntiteSimple & {
  code: string;

  nbCommunes?: number;

  nbLieuxdits?: number;
}
