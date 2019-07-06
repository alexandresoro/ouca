import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import { TABLE_COMPORTEMENT } from "../../utils/constants";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportComportementService extends ImportEntiteAvecLibelleEtCodeService {
  protected getTableName(): string {
    return TABLE_COMPORTEMENT;
  }
  protected getDbMapping(): { [column: string]: string } {
    return DB_SAVE_MAPPING.comportement;
  }
  protected getAnEntityName(): string {
    return "un comportement";
  }
}
