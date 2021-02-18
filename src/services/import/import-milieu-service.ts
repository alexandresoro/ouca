import { Milieu } from "@ou-ca/ouca-model";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { persistMilieu } from "../../sql-api/sql-api-milieu";
import { TABLE_MILIEU } from "../../utils/constants";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportMilieuService extends ImportEntiteAvecLibelleEtCodeService {
  protected getTableName(): string {
    return TABLE_MILIEU;
  }

  protected getAnEntityName(): string {
    return "un milieu";
  }

  protected saveEntity = async (milieu: Milieu): Promise<SqlSaveResponse> => {
    return persistMilieu(milieu);
  };
}
