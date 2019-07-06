import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import { TABLE_METEO } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportMeteoService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_METEO;
  }
  protected getDbMapping(): { [column: string]: string } {
    return DB_SAVE_MAPPING.meteo;
  }
  protected getThisEntityName(): string {
    return "Cette météo";
  }
}
