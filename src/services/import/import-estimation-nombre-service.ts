import { type EstimationNombre, type Prisma } from "@prisma/client";
import { ImportedEstimationNombre } from "../../objects/import/imported-estimation-nombre.object";
import { type LoggedUser } from "../../types/LoggedUser";
import { createEstimationsNombre, findEstimationsNombre } from "../entities/estimation-nombre-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportEstimationNombreService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findEstimationsNombre(null);
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
  ): Promise<Prisma.BatchPayload> => {
    return createEstimationsNombre(estimationsNombre, loggedUser);
  };
}
