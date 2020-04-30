import { Age } from "ouca-common/age.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { persistAge } from "../../sql-api/sql-api-age";
import { TABLE_AGE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportAgeService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_AGE;
  }

  protected getThisEntityName(): string {
    return "Cet âge";
  }

  protected saveEntity = async (age: Age): Promise<SqlSaveResponse> => {
    return persistAge(age);
  };
}
