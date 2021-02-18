import { EntiteAvecLibelleEtCode } from "@ou-ca/ouca-model";
import { ImportedEntiteAvecLibelleEtCode } from "../../objects/import/imported-entite-avec-libelle-et-code.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { findAllEntities } from "../../sql-api/sql-api-common";
import { ImportService } from "./import-service";

export abstract class ImportEntiteAvecLibelleEtCodeService extends ImportService {

  private entities: EntiteAvecLibelleEtCode[];

  protected getNumberOfColumns = (): number => {
    return 2;
  };

  protected init = async (): Promise<void> => {
    this.entities = await findAllEntities(this.getTableName());
  };

  protected importEntity = async (entityTab: string[]): Promise<string> => {
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
      return (
        "Il existe déjà " +
        this.getAnEntityName() +
        " avec ce code ou ce libellé"
      );
    }

    // Create and save the entity
    const entityToSave = importedEntity.buildEntiteAvecLibelleEtCode();

    const saveResult = await this.saveEntity(entityToSave);
    if (!saveResult?.insertId) {
      return "Une erreur est survenue pendant l'import";
    }

    this.entities.push(entityToSave);
    return null;
  };

  protected abstract saveEntity(entity: unknown): Promise<SqlSaveResponse>;

  protected abstract getTableName(): string;

  protected abstract getAnEntityName(): string;
}
