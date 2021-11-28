import { Classe, Prisma } from "@prisma/client";
import { createClasses, findAllClasses } from "../entities/classe-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportClasseService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    throw new Error("Method not implemented.");
  }
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllClasses();
  };

  protected getThisEntityName(): string {
    return "Cette classe espèce";
  }

  protected saveEntities = (classes: Omit<Classe, 'id'>[]): Promise<Prisma.BatchPayload> => {
    return createClasses(classes);
  };
}
