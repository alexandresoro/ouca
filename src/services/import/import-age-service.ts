import { Age } from "@prisma/client";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { TABLE_AGE } from "../../utils/constants";
import { insertAges } from "../entities/age-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportAgeService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_AGE;
  }

  protected getThisEntityName(): string {
    return "Cet âge";
  }

  protected saveEntities = (ages: Age[]): Promise<SqlSaveResponse> => {
    return insertAges(ages);
  };
}
