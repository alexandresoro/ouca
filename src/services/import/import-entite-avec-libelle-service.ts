import { EntiteAvecLibelle } from "ouca-common/entite-avec-libelle.object";
import { getEntityByLibelle, saveEntity } from "../../sql-api/sql-api-common";
import { ImportService } from "./import-service";

export abstract class ImportEntiteAvecLibelleService extends ImportService {
  protected LIBELLE_INDEX: number = 0;

  protected getNumberOfColumns = (): number => {
    return 1;
  };

  protected buildEntity = (entityTab: string[]): EntiteAvecLibelle => {
    return {
      id: null,
      libelle: entityTab[this.LIBELLE_INDEX].trim()
    };
  };

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    if (!this.isLibelleValid(entityTab[this.LIBELLE_INDEX])) {
      return false;
    }

    // Check that the entity does not exist
    const entity = await getEntityByLibelle<EntiteAvecLibelle>(
      entityTab[this.LIBELLE_INDEX],
      this.getTableName()
    );

    if (entity) {
      this.message = this.getThisEntityName() + " existe déjà";
      return false;
    }

    // Create and save the entity
    const entityToSave: EntiteAvecLibelle = this.buildEntity(entityTab);

    return await saveEntity(
      this.getTableName(),
      entityToSave,
      this.getDbMapping()
    );
  };

  protected abstract getTableName(): string;

  protected abstract getDbMapping(): { [column: string]: string };

  protected abstract getThisEntityName(): string;

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
  };
}
