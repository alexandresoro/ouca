import { Prisma } from "@prisma/client";
import { ImportedEntiteAvecLibelle } from "../../objects/import/imported-entite-avec-libelle.object";
import { ImportService } from "./import-service";

export abstract class ImportEntiteAvecLibelleService extends ImportService {
  protected entities!: { libelle: string }[];

  protected entitiesToInsert!: { libelle: string }[];

  protected getNumberOfColumns = (): number => {
    return 1;
  };

  protected getImportedEntity = (entityTab: string[]): ImportedEntiteAvecLibelle => {
    return new ImportedEntiteAvecLibelle(entityTab);
  };
  protected validateAndPrepareEntity = (entityTab: string[]): string | null => {
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
  };

  protected abstract saveEntities(entities: { libelle: string }[]): Promise<Prisma.BatchPayload>;

  protected abstract getThisEntityName(): string;
}
