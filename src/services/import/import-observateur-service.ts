import { Observateur, Prisma } from "@prisma/client";
import { createObservateurs, findObservateurs } from "../entities/observateur-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportObservateurService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findObservateurs();
  };

  protected getThisEntityName(): string {
    return "Cet observateur";
  }

  protected saveEntities = (observateurs: Omit<Observateur, "id">[]): Promise<Prisma.BatchPayload> => {
    return createObservateurs(observateurs);
  };
}
