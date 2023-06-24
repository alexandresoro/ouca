import { type DistanceEstimate } from "@ou-ca/common/entities/distance-estimate";
import { type EstimationDistance } from "../../repositories/estimation-distance/estimation-distance-repository-types.js";
import { type LoggedUser } from "../../types/User.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportEstimationDistanceService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.estimationDistanceService.findAllEstimationsDistance();
  };

  protected getThisEntityName(): string {
    return "Cette estimation de la distance";
  }

  protected saveEntities = (
    estimationsDistance: Omit<EstimationDistance, "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly DistanceEstimate[]> => {
    return this.services.estimationDistanceService.createEstimationsDistance(estimationsDistance, loggedUser);
  };
}
