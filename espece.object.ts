import { Classe } from "./classe.object";
import { EntiteSimple } from "./entite-simple.object";

export interface Espece extends EntiteSimple {
  classe?: Classe;

  classeId: number;

  code: string;

  nomFrancais: string;

  nomLatin: string;
}
