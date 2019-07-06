import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import { TABLE_AGE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportAgeService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_AGE;
  }
  protected getDbMapping(): { [column: string]: string } {
    return DB_SAVE_MAPPING.age;
  }
  protected getThisEntityName(): string {
    return "Cet âge";
  }
}
