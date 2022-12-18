import { type Prisma } from "@prisma/client";
import { type Milieu } from "../../repositories/milieu/milieu-repository-types";
import { type LoggedUser } from "../../types/User";
import { createMilieux, findMilieux } from "../entities/milieu-service";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportMilieuService extends ImportEntiteAvecLibelleEtCodeService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findMilieux(null);
  };

  protected getAnEntityName(): string {
    return "un milieu";
  }

  protected saveEntities = (
    milieux: Omit<Milieu, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<Prisma.BatchPayload> => {
    return createMilieux(milieux, loggedUser);
  };
}
