import { Sexe } from "../../model/types/sexe.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { TABLE_SEXE } from "../../utils/constants";
import { insertSexes } from "../entities/sexe-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportSexeService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_SEXE;
  }

  protected getThisEntityName(): string {
    return "Ce sexe";
  }

  protected saveEntities = (sexes: Sexe[]): Promise<SqlSaveResponse> => {
    return insertSexes(sexes);
  };

}
