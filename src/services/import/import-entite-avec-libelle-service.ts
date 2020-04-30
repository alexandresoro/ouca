import { EntiteAvecLibelle } from "ouca-common/entite-avec-libelle.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { findEntityByLibelle } from "../../sql-api/sql-api-common";
import { ImportService } from "./import-service";

export abstract class ImportEntiteAvecLibelleService extends ImportService {
  protected readonly LIBELLE_INDEX = 0;

  private readonly LIBELLE_MAX_LENGTH = 100;

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
    const entity = await findEntityByLibelle<EntiteAvecLibelle>(
      entityTab[this.LIBELLE_INDEX],
      this.getTableName()
    );

    if (entity) {
      this.message = this.getThisEntityName() + " existe déjà";
      return false;
    }

    // Create and save the entity
    const entityToSave = this.buildEntity(entityTab);

    const saveResult = await this.saveEntity(entityToSave);
    return !!saveResult?.insertId;
  };

  protected abstract saveEntity(entity: unknown): Promise<SqlSaveResponse>;

  protected abstract getTableName(): string;

  protected abstract getThisEntityName(): string;

  private isLibelleValid = (libelle: string): boolean => {
    libelle = libelle.trim();

    if (!libelle) {
      this.message = "Le libellé ne peut pas être vide";
      return false;
    }

    if (libelle.length > this.LIBELLE_MAX_LENGTH) {
      this.message =
        "La longueur maximale du libellé est de " +
        this.LIBELLE_MAX_LENGTH +
        " caractères";
      return false;
    }

    return true;
  };
}
