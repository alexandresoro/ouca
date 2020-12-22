import { EntiteAvecLibelle } from "@ou-ca/ouca-model/entite-avec-libelle.object";
import { ImportedEntiteAvecLibelle } from "../../objects/import/imported-entite-avec-libelle.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { findAllEntities } from "../../sql-api/sql-api-common";
import { ImportService } from "./import-service";

export abstract class ImportEntiteAvecLibelleService extends ImportService {


  private entities: EntiteAvecLibelle[];

  protected getNumberOfColumns = (): number => {
    return 1;
  };

  protected init = async (): Promise<void> => {
    this.entities = await findAllEntities(this.getTableName());
  };

  protected getImportedEntity = (entityTab: string[]): ImportedEntiteAvecLibelle => {
    return new ImportedEntiteAvecLibelle(entityTab);
  }

  protected importEntity = async (entityTab: string[]): Promise<string> => {
    const importedEntity = this.getImportedEntity(entityTab);

    const dataValidity = importedEntity.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the entity does not exist
    const existingEntity = this.entities.find((e) => {
      return e.libelle === importedEntity.libelle;
    });
    if (existingEntity) {
      return `${this.getThisEntityName()} existe déjà`;
    }

    // Create and save the entity
    const entityToSave = importedEntity.buildEntiteAvecLibelle();

    const saveResult = await this.saveEntity(entityToSave);
    if (!saveResult?.insertId) {
      return "Une erreur est survenue pendant l'import";
    }

    this.entities.push(entityToSave);
    return null;
  };

  protected abstract saveEntity(entity: unknown): Promise<SqlSaveResponse>;

  protected abstract getTableName(): string;

  protected abstract getThisEntityName(): string;

}
