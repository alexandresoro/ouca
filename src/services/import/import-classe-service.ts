import { Classe } from "../../model/types/classe.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { persistClasse } from "../../sql-api/sql-api-classe";
import { TABLE_CLASSE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportClasseService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_CLASSE;
  }

  protected getThisEntityName(): string {
    return "Cette classe espèce";
  }

  protected saveEntity = async (classe: Classe): Promise<SqlSaveResponse> => {
    return persistClasse(classe);
  };
}
