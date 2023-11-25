import { type LoggedUser } from "@domain/user/logged-user.js";
import { type NumberEstimate } from "@ou-ca/common/api/entities/number-estimate";
import { ImportedEstimationNombre } from "../../objects/import/imported-estimation-nombre.object.js";
import { type EstimationNombre } from "../../repositories/estimation-nombre/estimation-nombre-repository-types.js";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service.js";

export class ImportEstimationNombreService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await this.services.estimationNombreService.findAllEstimationsNombre();
  };

  protected getThisEntityName(): string {
    return "Cette estimation du nombre";
  }

  protected getImportedEntity = (entityTab: string[]): ImportedEstimationNombre => {
    return new ImportedEstimationNombre(entityTab);
  };

  protected saveEntities = (
    estimationsNombre: Omit<EstimationNombre, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<readonly NumberEstimate[]> => {
    return this.services.estimationNombreService.createEstimationsNombre(
      estimationsNombre.map((estimationNombre) => {
        return {
          ...estimationNombre,
          non_compte: false,
        };
      }),
      loggedUser
    );
  };
}
