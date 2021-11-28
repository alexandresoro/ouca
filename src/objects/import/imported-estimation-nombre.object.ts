import { EstimationNombre } from "@prisma/client";
import { ImportedEntiteAvecLibelle } from "./imported-entite-avec-libelle.object";

export class ImportedEstimationNombre extends ImportedEntiteAvecLibelle {

  buildEntiteAvecLibelle = (): Omit<EstimationNombre, 'id'> => {
    return {
      libelle: this.libelle,
      nonCompte: false
    };
  };
}