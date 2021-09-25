import { Meteo } from "@prisma/client";
import { SqlSaveResponse } from "../../objects/sql-save-response.object";
import { TABLE_METEO } from "../../utils/constants";
import { insertMeteos } from "../entities/meteo-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportMeteoService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_METEO;
  }

  protected getThisEntityName(): string {
    return "Cette météo";
  }

  protected saveEntities = (meteos: Meteo[]): Promise<SqlSaveResponse> => {
    return insertMeteos(meteos);
  };
}
