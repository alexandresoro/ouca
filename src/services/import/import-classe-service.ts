import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import { TABLE_CLASSE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportClasseService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_CLASSE;
  }
  protected getDbMapping(): { [column: string]: string } {
    return DB_SAVE_MAPPING.classe;
  }
  protected getThisEntityName(): string {
    return "Cette classe espèce";
  }
}
