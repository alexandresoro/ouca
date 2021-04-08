import { EntiteAvecLibelleEtCode } from "../../model/types/entite-avec-libelle-et-code.object";
import { ImportedEntiteAvecLibelleEtCode } from "../../objects/import/imported-entite-avec-libelle-et-code.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { findAllEntities } from "../../sql-api/sql-api-common";
import { ImportService } from "./import-service";

export abstract class ImportEntiteAvecLibelleEtCodeService extends ImportService {

  private entities: EntiteAvecLibelleEtCode[];

  private entitiesToInsert: EntiteAvecLibelleEtCode[];

  protected getNumberOfColumns = (): number => {
    return 2;
  };

  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllEntities(this.getTableName());
  };

  protected validateAndPrepareEntity = (entityTab: string[]): string => {
    const importedEntity = new ImportedEntiteAvecLibelleEtCode(entityTab);

    const dataValidity = importedEntity.checkValidity();
    if (dataValidity) {
      return dataValidity;
    }

    // Check that the entity does not exist
    const existingEntity = this.entities.find((e) => {
      return (
        this.compareStrings(e.code, importedEntity.code) ||
        this.compareStrings(e.libelle, importedEntity.libelle)
      );
    });
    if (existingEntity) {
      return `Il existe déjà ${this.getAnEntityName()} avec ce code ou ce libellé`;
    }

    // Create and save the entity
    const entityToSave = importedEntity.buildEntiteAvecLibelleEtCode();

    this.entitiesToInsert.push(entityToSave);
    this.entities.push(entityToSave);
    return null;
  };

  protected persistAllValidEntities = async (): Promise<void> => {
    if (this.entitiesToInsert.length) {
      await this.saveEntities(this.entitiesToInsert);
    }
  }

  protected abstract saveEntities(entities: EntiteAvecLibelleEtCode[]): Promise<SqlSaveResponse>;

  protected abstract getTableName(): string;

  protected abstract getAnEntityName(): string;
}
