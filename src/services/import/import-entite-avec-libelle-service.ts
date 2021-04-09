import { EntiteAvecLibelle } from "../../model/types/entite-avec-libelle.object";
import { ImportedEntiteAvecLibelle } from "../../objects/import/imported-entite-avec-libelle.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { findAllEntities } from "../entities/entity-service";
import { ImportService } from "./import-service";

export abstract class ImportEntiteAvecLibelleService extends ImportService {

  private entities: EntiteAvecLibelle[];

  private entitiesToInsert: EntiteAvecLibelle[];

  protected getNumberOfColumns = (): number => {
    return 1;
  };

  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllEntities(this.getTableName());
  };

  protected getImportedEntity = (entityTab: string[]): ImportedEntiteAvecLibelle => {
    return new ImportedEntiteAvecLibelle(entityTab);
  }
  protected validateAndPrepareEntity = (entityTab: string[]): string => {
    const importedEntity = this.getImportedEntity(entityTab);

    const dataValidity = importedEntity.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the entity does not exist
    const existingEntity = this.entities.find((e) => {
      return this.compareStrings(e.libelle, importedEntity.libelle);
    });
    if (existingEntity) {
      return `${this.getThisEntityName()} existe déjà`;
    }

    // Create and save the entity
    const entityToSave = importedEntity.buildEntiteAvecLibelle();

    this.entitiesToInsert.push(entityToSave);
    this.entities.push(entityToSave);
    return null;
  };

  protected persistAllValidEntities = async (): Promise<void> => {
    if (this.entitiesToInsert.length) {
      await this.saveEntities(this.entitiesToInsert);
    }
  }

  protected abstract saveEntities(entities: EntiteAvecLibelle[]): Promise<SqlSaveResponse>;

  protected abstract getTableName(): string;

  protected abstract getThisEntityName(): string;

}
