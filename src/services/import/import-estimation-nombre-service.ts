import { EstimationNombre } from "../../basenaturaliste-model/estimation-nombre.object";
import { DB_SAVE_MAPPING } from "../../sql/sql-queries-utils";
import { TABLE_ESTIMATION_NOMBRE } from "../../utils/constants";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportEstimationNombreService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    return TABLE_ESTIMATION_NOMBRE;
  }
  protected getDbMapping(): { [column: string]: string } {
    return DB_SAVE_MAPPING.estimationNombre;
  }
  protected getThisEntityName(): string {
    return "Cette estimation du nombre";
  }

  protected buildEntity = (entityTab: string[]): EstimationNombre => {
    return {
      id: null,
      libelle: entityTab[this.LIBELLE_INDEX].trim(),
      nonCompte: false
    };
  }
}
