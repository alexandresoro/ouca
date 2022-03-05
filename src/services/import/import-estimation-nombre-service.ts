import { EstimationNombre, Prisma } from "@prisma/client";
import { ImportedEstimationNombre } from "../../objects/import/imported-estimation-nombre.object";
import { createEstimationsNombre, findAllEstimationsNombre } from "../entities/estimation-nombre-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportEstimationNombreService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllEstimationsNombre();
  };

  protected getThisEntityName(): string {
    return "Cette estimation du nombre";
  }

  protected getImportedEntity = (entityTab: string[]): ImportedEstimationNombre => {
    return new ImportedEstimationNombre(entityTab);
  };

  protected saveEntities = (estimationsNombre: Omit<EstimationNombre, "id">[]): Promise<Prisma.BatchPayload> => {
    return createEstimationsNombre(estimationsNombre);
  };
}
