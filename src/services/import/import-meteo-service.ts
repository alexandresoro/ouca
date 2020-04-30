import { Meteo } from "ouca-common/meteo.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { persistMeteo } from "../../sql-api/sql-api-meteo";
import { TABLE_METEO } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportMeteoService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_METEO;
  }

  protected getThisEntityName(): string {
    return "Cette météo";
  }

  protected saveEntity = async (meteo: Meteo): Promise<SqlSaveResponse> => {
    return persistMeteo(meteo);
  };
}
