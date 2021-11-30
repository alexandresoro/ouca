import { Prisma } from "@prisma/client";
import { ImportedEntiteAvecLibelleEtCode } from "../../objects/import/imported-entite-avec-libelle-et-code.object";
import { ImportService } from "./import-service";

export abstract class ImportEntiteAvecLibelleEtCodeService extends ImportService {

  protected entities: { libelle: string, code: string }[];

  protected entitiesToInsert: { libelle: string, code: string }[];

  protected getNumberOfColumns = (): number => {
    return 2;
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

  protected abstract saveEntities(entities: { libelle: string, code: string }[]): Promise<Prisma.BatchPayload>;

  protected abstract getAnEntityName(): string;
}
