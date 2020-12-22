import { EstimationNombre } from "@ou-ca/ouca-model/estimation-nombre.object";
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