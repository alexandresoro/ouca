import { Classe } from "../../model/types/classe.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { TABLE_CLASSE } from "../../utils/constants";
import { insertClasses } from "../entities/classe-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportClasseService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_CLASSE;
  }

  protected getThisEntityName(): string {
    return "Cette classe espèce";
  }

  protected saveEntities = (classes: Classe[]): Promise<SqlSaveResponse> => {
    return insertClasses(classes);
  };
}
