import { Classe, Prisma } from "@prisma/client";
import { createClasses, findClasses } from "../entities/classe-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportClasseService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findClasses();
  };

  protected getThisEntityName(): string {
    return "Cette classe espèce";
  }

  protected saveEntities = (classes: Omit<Classe, "id">[]): Promise<Prisma.BatchPayload> => {
    return createClasses(classes);
  };
}
