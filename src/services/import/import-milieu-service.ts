import { Milieu } from "../../model/types/milieu.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { insertMilieux } from "../../sql-api/sql-api-milieu";
import { TABLE_MILIEU } from "../../utils/constants";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportMilieuService extends ImportEntiteAvecLibelleEtCodeService {
  protected getTableName(): string {
    return TABLE_MILIEU;
  }

  protected getAnEntityName(): string {
    return "un milieu";
  }

  protected saveEntities = (milieux: Milieu[]): Promise<SqlSaveResponse> => {
    return insertMilieux(milieux);
  };
}
