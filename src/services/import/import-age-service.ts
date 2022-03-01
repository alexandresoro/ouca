import { Age, Prisma } from "@prisma/client";
import { createAges, findAges } from "../entities/age-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportAgeService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAges();
  };

  protected getThisEntityName(): string {
    return "Cet âge";
  }

  protected saveEntities = (ages: Omit<Age, "id">[]): Promise<Prisma.BatchPayload> => {
    return createAges(ages);
  };
}
