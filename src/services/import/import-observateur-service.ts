import { Observateur, Prisma } from "@prisma/client";
import { createObservateurs, findAllObservateurs } from "../entities/observateur-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportObservateurService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    throw new Error("Method not implemented.");
  }
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllObservateurs(false);
  };

  protected getThisEntityName(): string {
    return "Cet observateur";
  }

  protected saveEntities = (observateurs: Omit<Observateur, 'id'>[]): Promise<Prisma.BatchPayload> => {
    return createObservateurs(observateurs);
  };

}
