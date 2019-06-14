import { Observateur } from "basenaturaliste-model/observateur.object";
import { ImportService } from "./import-service";

export class ImportLieuxditService extends ImportService {
  private LIBELLE_INDEX: number = 0;

  protected saveObject(objectTab: string[]): void {
    // TODO
  }

  protected getNumberOfColumns = () => {
    return 1;
  }

  protected getObject = (objectTab: string[]): Observateur => {
    return {
      id: null,
      libelle: objectTab[this.LIBELLE_INDEX]
    };
  }

  protected isObjectValid = (objectTab: string[]): boolean => {
    return this.isLibelleValid(objectTab[this.LIBELLE_INDEX]);
  }

  private isLibelleValid = (libelle: string): boolean => {
    if (!libelle) {
      this.message = "Le libellé ne peut pas être vide";
      return false;
    }

    if (libelle.length > 100) {
      this.message = "La longueur maximale du libellé est 100 caractères";
      return false;
    }

    return true;
  }
}
