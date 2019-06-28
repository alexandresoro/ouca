import { Observateur } from "../basenaturaliste-model/observateur.object";
import { ImportService } from "./import-service";

export class ImportLieuxditService {
  private DEPARTEMENT_INDEX: number = 0;
  private CODE_COMMUNE_INDEX: number = 1;
  private NOM_COMMUNE_INDEX: number = 2;
  private NOM_INDEX: number = 3;
  private ALTITUDE_INDEX: number = 4;
  private LONGITUDE_INDEX: number = 5;
  private LATITUDE_INDEX: number = 6;

  protected saveObject(objectTab: string[]): void {
    // TODO
  }

  protected getNumberOfColumns = () => {
    return 7;
  }

  protected getObject = (objectTab: string[]): Observateur => {
    return {
      id: null,
      libelle: objectTab[this.DEPARTEMENT_INDEX]
    };
  }

  protected isObjectValid = (objectTab: string[]): boolean => {
    return this.isLibelleValid(objectTab[this.DEPARTEMENT_INDEX]);
  }

  private isLibelleValid = (libelle: string): boolean => {
    if (!libelle) {
      // this.message = "Le libellé ne peut pas être vide";
      return false;
    }

    if (libelle.length > 100) {
      // this.message = "La longueur maximale du libellé est 100 caractères";
      return false;
    }

    return true;
  }
}
