import { type Prisma } from "@prisma/client";
import { type EstimationDistance } from "../../repositories/estimation-distance/estimation-distance-repository-types";
import { type LoggedUser } from "../../types/User";
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
