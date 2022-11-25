import { type EstimationNombre } from "@prisma/client";
import { ImportedEntiteAvecLibelle } from "./imported-entite-avec-libelle.object";

export class ImportedEstimationNombre extends ImportedEntiteAvecLibelle {
  buildEntiteAvecLibelle = (): Pick<EstimationNombre, "libelle" | "nonCompte"> => {
    return {
      libelle: this.libelle,
      nonCompte: false,
    };
  };
}
