import { type Prisma, type Sexe } from "@prisma/client";
import { type LoggedUser } from "../../types/User";
import { createSexes, findSexes } from "../entities/sexe-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportSexeService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findSexes(null);
  };

  protected getThisEntityName(): string {
    return "Ce sexe";
  }

  protected saveEntities = (
    ages: Omit<Sexe, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<Prisma.BatchPayload> => {
    return createSexes(ages, loggedUser);
  };
}
