import { Sexe } from "@ou-ca/ouca-model";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { persistSexe } from "../../sql-api/sql-api-sexe";
import { TABLE_SEXE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportSexeService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_SEXE;
  }

  protected getThisEntityName(): string {
    return "Ce sexe";
  }

  protected saveEntity = async (sexe: Sexe): Promise<SqlSaveResponse> => {
    return persistSexe(sexe);
  };
}
