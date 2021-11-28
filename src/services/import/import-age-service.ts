import { Age, Prisma } from "@prisma/client";
import { createAges, findAllAges } from "../entities/age-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportAgeService extends ImportEntiteAvecLibelleService {

  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllAges({ includeCounts: false });
  };

  protected getThisEntityName(): string {
    return "Cet âge";
  }

  protected saveEntities = (ages: Omit<Age, 'id'>[]): Promise<Prisma.BatchPayload> => {
    return createAges(ages);
  };
}
