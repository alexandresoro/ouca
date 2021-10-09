import { EstimationNombre } from "../../model/graphql";
import { ImportedEstimationNombre } from "../../objects/import/imported-estimation-nombre.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { TABLE_ESTIMATION_NOMBRE } from "../../utils/constants";
import { insertEstimationsNombre } from "../entities/estimation-nombre-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportEstimationNombreService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_ESTIMATION_NOMBRE;
  }

  protected getThisEntityName(): string {
    return "Cette estimation du nombre";
  }

  protected getImportedEntity = (entityTab: string[]): ImportedEstimationNombre => {
    return new ImportedEstimationNombre(entityTab);
  }

  protected saveEntities = (estimations: EstimationNombre[]): Promise<SqlSaveResponse> => {
    return insertEstimationsNombre(estimations);
  };
}
