import { Meteo } from "../../model/types/meteo.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { insertMeteos } from "../../sql-api/sql-api-meteo";
import { TABLE_METEO } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportMeteoService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_METEO;
  }

  protected getThisEntityName(): string {
    return "Cette météo";
  }

  protected saveEntities = (meteos: Meteo[]): Promise<SqlSaveResponse> => {
    return insertMeteos(meteos);
  };
}
