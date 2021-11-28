import { Prisma, Sexe } from "@prisma/client";
import { createSexes, findAllSexes } from "../entities/sexe-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportSexeService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    throw new Error("Method not implemented.");
  }
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllSexes({ includeCounts: false });
  };

  protected getThisEntityName(): string {
    return "Ce sexe";
  }

  protected saveEntities = (ages: Omit<Sexe, 'id'>[]): Promise<Prisma.BatchPayload> => {
    return createSexes(ages);
  };
}
