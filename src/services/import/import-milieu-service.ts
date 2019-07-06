import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import { TABLE_MILIEU } from "../../utils/constants";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportMilieuService extends ImportEntiteAvecLibelleEtCodeService {
  protected getTableName(): string {
    return TABLE_MILIEU;
  }
  protected getDbMapping(): { [column: string]: string } {
    return DB_SAVE_MAPPING.milieu;
  }
  protected getAnEntityName(): string {
    return "un milieu";
  }
}
