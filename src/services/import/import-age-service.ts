import { type Age, type Prisma } from "@prisma/client";
import { type LoggedUser } from "../../types/LoggedUser";
import { createAges, findAges } from "../entities/age-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportAgeService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAges(null);
  };

  protected getThisEntityName(): string {
    return "Cet âge";
  }

  protected saveEntities = (
    ages: Omit<Age, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<Prisma.BatchPayload> => {
    return createAges(ages, loggedUser);
  };
}
