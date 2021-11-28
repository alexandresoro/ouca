import { EstimationDistance, Prisma } from "@prisma/client";
import { createEstimationsDistance, findAllEstimationsDistance } from "../entities/estimation-distance-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportEstimationDistanceService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    throw new Error("Method not implemented.");
  }
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllEstimationsDistance();
  };

  protected getThisEntityName(): string {
    return "Cette estimation de la distance";
  }

  protected saveEntities = (estimationsDistance: Omit<EstimationDistance, 'id'>[]): Promise<Prisma.BatchPayload> => {
    return createEstimationsDistance(estimationsDistance);
  };
}
