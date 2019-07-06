import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import { TABLE_SEXE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportSexeService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_SEXE;
  }
  protected getDbMapping(): { [column: string]: string } {
    return DB_SAVE_MAPPING.sexe;
  }
  protected getThisEntityName(): string {
    return "Ce sexe";
  }
}
