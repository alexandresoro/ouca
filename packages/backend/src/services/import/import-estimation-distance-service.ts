import { type LoggedUser } from "@domain/user/logged-user.js";
import { type DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportEstimationDistanceService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.distanceEstimateService.findAllEstimationsDistance();
  };

  protected getThisEntityName(): string {
    return "Cette estimation de la distance";
  }

  protected saveEntities = (
    estimationsDistance: Omit<DistanceEstimate, "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly DistanceEstimate[]> => {
    return this.services.distanceEstimateService.createEstimationsDistance(estimationsDistance, loggedUser);
  };
}
