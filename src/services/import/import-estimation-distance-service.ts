import { EstimationDistance, Prisma } from "@prisma/client";
import { LoggedUser } from "../../types/LoggedUser";
import { createEstimationsDistance, findEstimationsDistance } from "../entities/estimation-distance-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportEstimationDistanceService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findEstimationsDistance(null);
  };

  protected getThisEntityName(): string {
    return "Cette estimation de la distance";
  }

  protected saveEntities = (
    estimationsDistance: Omit<EstimationDistance, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<Prisma.BatchPayload> => {
    return createEstimationsDistance(estimationsDistance, loggedUser);
  };
}
