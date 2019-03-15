import { Classe } from "./classe.object";
import { EntiteAvecLibelle } from "./entite-avec-libelle.object";

export interface Espece extends EntiteAvecLibelle {
  classe: Classe;

  classeId: number;

  code: string;

  nomFrancais: string;

  nomLatin: string;
}
