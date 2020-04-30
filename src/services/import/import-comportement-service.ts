import { Comportement } from "ouca-common/comportement.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { persistComportement } from "../../sql-api/sql-api-comportement";
import { TABLE_COMPORTEMENT } from "../../utils/constants";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportComportementService extends ImportEntiteAvecLibelleEtCodeService {
  protected getTableName(): string {
    return TABLE_COMPORTEMENT;
  }

  protected getAnEntityName(): string {
    return "un comportement";
  }

  protected saveEntity = async (
    comportement: Comportement
  ): Promise<SqlSaveResponse> => {
    return persistComportement(comportement);
  };
}
