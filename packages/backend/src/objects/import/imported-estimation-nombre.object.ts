import { type EstimationNombre } from "../../repositories/estimation-nombre/estimation-nombre-repository-types.js";
import { ImportedEntiteAvecLibelle } from "./imported-entite-avec-libelle.object.js";

export class ImportedEstimationNombre extends ImportedEntiteAvecLibelle {
  buildEntiteAvecLibelle = (): Pick<EstimationNombre, "libelle" | "nonCompte"> => {
    return {
      libelle: this.libelle,
      nonCompte: false,
    };
  };
}
