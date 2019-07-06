import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import { TABLE_ESTIMATION_DISTANCE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportEstimationDistanceService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_ESTIMATION_DISTANCE;
  }
  protected getDbMapping(): { [column: string]: string } {
    return DB_SAVE_MAPPING.estimationDistance;
  }
  protected getThisEntityName(): string {
    return "Cette estimation de la distance";
  }
}
