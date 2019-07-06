import { Observateur } from "../basenaturaliste-model/observateur.object";
import { SqlConnection } from "../sql/sql-connection";
import { getQueryToFindEntityByLibelle } from "../sql/sql-queries-utils";
import { ImportService } from "./import-service";

export class ImportObservateurService extends ImportService {
  private LIBELLE_INDEX: number = 0;
  protected createEntity(entityTab: string[]): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  protected getNumberOfColumns = () => {
    return 1;
  }

  protected getEntity = (entityTab: string[]): Observateur => {
    return {
      id: null,
      libelle: entityTab[this.LIBELLE_INDEX].trim()
    };
  }

  protected isEntityValid = async (entityTab: string[]): Promise<boolean> => {
    if (!this.isLibelleValid(entityTab[this.LIBELLE_INDEX])) {
      return false;
    }

    return !(await this.isExistingEntity(entityTab));
  }

  protected isExistingEntity = async (
    entityTab: string[]
  ): Promise<boolean> => {
    const results = await SqlConnection.query(
      getQueryToFindEntityByLibelle(
        "observateur",
        entityTab[this.LIBELLE_INDEX]
      )
    );

    if (results && results[0] && results[0].id) {
      // The entity already exists
      this.message = "Il existe déjà un observateur avec ce libellé.";
      return true;
    }

    return false;
  }

  private isLibelleValid = (libelle: string): boolean => {
    libelle = libelle.trim();

    if (!libelle) {
      this.message = "Le libellé ne peut pas être vide";
      return false;
    }

    if (libelle.length > 100) {
      this.message = "La longueur maximale du libellé est de 100 caractères";
      return false;
    }

    return true;
  }
}
