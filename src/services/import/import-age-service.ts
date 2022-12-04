import { type Age, type Prisma } from "@prisma/client";
import { type LoggedUser } from "../../types/User";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportAgeService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.ageService.findAges(null);
  };

  protected getThisEntityName(): string {
    return "Cet âge";
  }

  protected saveEntities = (
    ages: Omit<Age, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<Prisma.BatchPayload> => {
    return this.services.ageService.createAges(ages, loggedUser);
  };
}
