import { EstimationNombre } from "ouca-common/estimation-nombre.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { persistEstimationNombre } from "../../sql-api/sql-api-estimation-nombre";
import { TABLE_ESTIMATION_NOMBRE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportEstimationNombreService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_ESTIMATION_NOMBRE;
  }

  protected getThisEntityName(): string {
    return "Cette estimation du nombre";
  }

  protected buildEntity = (entityTab: string[]): EstimationNombre => {
    return {
      id: null,
      libelle: entityTab[this.LIBELLE_INDEX].trim(),
      nonCompte: false
    };
  };

  protected saveEntity = async (
    estimation: EstimationNombre
  ): Promise<SqlSaveResponse> => {
    return persistEstimationNombre(estimation);
  };
}
