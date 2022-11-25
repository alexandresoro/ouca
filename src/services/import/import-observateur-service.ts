import { type Observateur, type Prisma } from "@prisma/client";
import { type LoggedUser } from "../../types/LoggedUser";
import { createObservateurs, findObservateurs } from "../entities/observateur-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportObservateurService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findObservateurs(null);
  };

  protected getThisEntityName(): string {
    return "Cet observateur";
  }

  protected saveEntities = (
    observateurs: Omit<Observateur, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<Prisma.BatchPayload> => {
    return createObservateurs(observateurs, loggedUser);
  };
}
