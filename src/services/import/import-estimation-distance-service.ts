import { EstimationDistance } from "@prisma/client";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { TABLE_ESTIMATION_DISTANCE } from "../../utils/constants";
import { insertEstimationsDistance } from "../entities/estimation-distance-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportEstimationDistanceService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_ESTIMATION_DISTANCE;
  }

  protected getThisEntityName(): string {
    return "Cette estimation de la distance";
  }

  protected saveEntities = (estimations: EstimationDistance[]): Promise<SqlSaveResponse> => {
    return insertEstimationsDistance(estimations);
  };
}
