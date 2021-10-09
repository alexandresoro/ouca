import { EstimationNombre } from "../../model/graphql";
import { ImportedEntiteAvecLibelle } from "./imported-entite-avec-libelle.object";

export class ImportedEstimationNombre extends ImportedEntiteAvecLibelle {

  buildEntiteAvecLibelle = (): EstimationNombre => {
    return {
      id: null,
      libelle: this.libelle,
      nonCompte: false
    };
  };
}