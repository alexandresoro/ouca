import { Observateur } from "@prisma/client";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { TABLE_OBSERVATEUR } from "../../utils/constants";
import { insertObservateurs } from "../entities/observateur-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportObservateurService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_OBSERVATEUR;
  }

  protected getThisEntityName(): string {
    return "Cet observateur";
  }

  protected saveEntities = (observateurs: Observateur[]): Promise<SqlSaveResponse> => {
    return insertObservateurs(observateurs);
  };

}
