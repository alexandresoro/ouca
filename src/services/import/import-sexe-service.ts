import { Prisma, Sexe } from "@prisma/client";
import { createSexes, findSexes } from "../entities/sexe-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportSexeService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findSexes();
  };

  protected getThisEntityName(): string {
    return "Ce sexe";
  }

  protected saveEntities = (ages: Omit<Sexe, "id">[]): Promise<Prisma.BatchPayload> => {
    return createSexes(ages);
  };
}
