import { Comportement } from "../../model/types/comportement.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { insertComportements } from "../../sql-api/sql-api-comportement";
import { TABLE_COMPORTEMENT } from "../../utils/constants";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportComportementService extends ImportEntiteAvecLibelleEtCodeService {
  protected getTableName(): string {
    return TABLE_COMPORTEMENT;
  }

  protected getAnEntityName(): string {
    return "un comportement";
  }

  protected saveEntities = (comportements: Comportement[]): Promise<SqlSaveResponse> => {
    return insertComportements(comportements);
  };
}
