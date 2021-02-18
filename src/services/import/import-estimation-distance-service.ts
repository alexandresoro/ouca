import { EstimationDistance } from "@ou-ca/ouca-model";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { persistEstimationDistance } from "../../sql-api/sql-api-estimation-distance";
import { TABLE_ESTIMATION_DISTANCE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportEstimationDistanceService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_ESTIMATION_DISTANCE;
  }

  protected getThisEntityName(): string {
    return "Cette estimation de la distance";
  }

  protected saveEntity = async (
    estimation: EstimationDistance
  ): Promise<SqlSaveResponse> => {
    return persistEstimationDistance(estimation);
  };
}
