import { Observateur } from "@ou-ca/ouca-model/observateur.object";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { persistObservateur } from "../../sql-api/sql-api-observateur";
import { TABLE_OBSERVATEUR } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportObservateurService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_OBSERVATEUR;
  }

  protected getThisEntityName(): string {
    return "Cet observateur";
  }

  protected saveEntity = async (
    observateur: Observateur
  ): Promise<SqlSaveResponse> => {
    return persistObservateur(observateur);
  };
}
